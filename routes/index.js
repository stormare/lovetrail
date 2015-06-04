var uuid 		= require('node-uuid');
var mongoose 	= require( 'mongoose' );
var Category    = mongoose.model( 'Category' );
var Trail		= mongoose.model( 'Trail' );

/*
 * GET home page.
 */
exports.index = function (req, res, next){
	
	var user_id = req.cookies ? req.cookies.user_id : undefined;
	
	Category.find( function ( err, categories, count ){
		if( err ) return next( err );
		Trail.find({}).
			populate('cat').
			sort('uid').
			sort('date').
			exec( function( err, trailList, count ) {
				if( err ) return next( err );
				Trail.
					find({ uid: user_id }).
					populate('cat').
					sort({date: 'asc'}).
					exec( function( err, userTrails, count ) {
						if( err ) return next( err );
						res.render( 'index', {
							title 		: 'Love Trail',
							categories 	: categories,
							userTrails 	: userTrails,
							trailList 	: trailList
						});
					});
			});
	});
};

/*
 * Trail CRUD
 */
exports.deleteTrail = function (req, res, next){
  Trail.findById( req.params.id, function ( err, trail ){
    var user_id = req.cookies ?
      req.cookies.user_id : undefined;
 
    if( trail.uid !== req.cookies.user_id ){
      res.send("forbidden");
    } else {
		trail.remove( function ( err, todo ){
		  if( err ) return next( err );
	 
		  res.redirect( '/' );
		});
	}
  });
};

exports.createTrail = function (req, res, next) {
	new Trail({
		uid		: req.cookies.user_id,
		lat		: req.body.lat,
		lon		: req.body.lon,
		cat		: req.body.cat,
		date	: Date.now(),
		desc 	: req.body.desc
	}).save(function (err) {
        if (err) return next(err);
        console.log('Task saved.');
		res.redirect('/');
	});
};

// redirect to index when finish
exports.updateTrailname = function (req, res, next){
	console.log(JSON.stringify(req.body));
	var user_id = req.cookies ? req.cookies.user_id : undefined;
	
	Trail.
	find({ uid: user_id }).
	exec( function ( err, trails ){
		if( err ) return next( err );
		trails.forEach( function (trail) {
			trail.name	= req.body.name;
			trail.save( function ( err, category, count ){
				if( err ) return next( err );
			});
			
		});
		res.send("success");
	});
};

// ** express turns the cookie key to lowercase **
exports.current_user = function ( req, res, next ){
  var user_id = req.cookies ?
      req.cookies.user_id : undefined;
 
  if( !user_id ){
    res.cookie( 'user_id', uuid.v1() );
  }
 
  next();
};