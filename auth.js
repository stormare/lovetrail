var passport = require('passport');
var mongoose 	= require( 'mongoose' );
var Category    = mongoose.model( 'Category' );
var Trail		= mongoose.model( 'Trail' );

module.exports = function (app) {
	//auth routes
	app.get('/admin', ensureAuthenticated, function(req, res){

		Category.
			find({}).
			sort({name: 'asc'}).
			exec( function ( err, categories, count ){
		
		Trail.
		find({}).
		populate('cat').
		sort('uid').
		sort({date: 'desc'}).
		exec( function( err, trails, count ) {
				res.render( 'admin', {
					title : 'Love Trail Admin',
					categories : categories,
					trails 	: trails,
					edit	: false
				});
		});
		

		});
	});

	app.get('/login', function(req, res){
	  res.render('login', { user: req.user, message: req.flash('error') });
	});
	app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
	  function(req, res) {
		res.redirect('/admin');
	 });
	app.get('/logout', function(req, res){
	  req.logout();
	  res.redirect('/');
	});
	
	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/login')
	}

}



