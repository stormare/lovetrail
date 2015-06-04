#!/bin/env node
//  OpenShift Node application
require('./db');
var express 		= require('express');
var fs      		= require('fs');
var mongoose 		= require('mongoose');
var routes 			= require('./routes');
var adminroutes 	= require('./routes/admin');
var http 			= require('http');
var path 			= require('path');
var passport 		= require('passport');
var LocalStrategy 	= require('passport-local').Strategy;
var flash 			= require('connect-flash');

var app = express();

/*Set up express variables*/
var engine = require('ejs-locals');

// all environments
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.bodyParser( { keepExtensions: true } ));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'l0v3tr4!l r0cks' }));
app.use(flash());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(routes.current_user);
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
	
		app.get('/', routes.index);
		app.post('/createTrail', routes.createTrail);
		app.get('/deleteTrail/:id', routes.deleteTrail);
		app.post('/updateTrailname', routes.updateTrailname);

		app.post('/createCategory', ensureAuthenticated, adminroutes.createCategory);
		app.get('/getCategories', ensureAuthenticated, adminroutes.getCategories);
		app.post('/getCategory/:id', ensureAuthenticated, adminroutes.getCategory);
		app.get('/deleteCategory/:id', ensureAuthenticated, adminroutes.deleteCategory);
		app.get('/editCategory/:id', ensureAuthenticated, adminroutes.editCategory);
		app.post('/updateCategory/:id', ensureAuthenticated, adminroutes.updateCategory);
		app.get('/deleteUserTrail/:id', ensureAuthenticated, adminroutes.deleteUserTrail);
		app.get('/deleteTrails/:uid', ensureAuthenticated, adminroutes.deleteTrails);
		app.get('/getFileList', ensureAuthenticated, adminroutes.getFileList);
		app.post('/upload', ensureAuthenticated, adminroutes.upload);
		app.post('/remove', ensureAuthenticated, adminroutes.remove);
		
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        //self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        //for (var r in self.routes) {
         //   self.app.get(r, self.routes[r]);
        //}
    };
	
	self.initializeDatabase = function () {
		
		// default to a 'localhost' configuration:
		var connection_string = '127.0.0.1:27017/lovetrail';
		// if OPENSHIFT env variables are present, use the available connection info:
		if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
		  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
		  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
		  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
		  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
		  process.env.OPENSHIFT_APP_NAME;
		}
		
		mongoose.connect(connection_string);
	
	}


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
		
		// Connect to mongoDB
		self.initializeDatabase();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
		//  Start the app on the specific interface (and port).
		http.createServer(app).listen(self.port, self.ipaddress, function(){
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();


/*
 * Passport authentication
 */
 
var users = [
    { id: 1, username: 'admin', password: 'msawsl!"§$' }
  , { id: 2, username: 'foo', password: 'bar' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // Find the user by username.  If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message.  Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));


require('./auth')(app);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	  res.redirect('/login')
}




