var uuid 		= require('node-uuid');
var mongoose 	= require( 'mongoose' );
var walk 		= require( 'walk' );
var fs 			= require('fs');
var path 		= require('path');
var Category    = mongoose.model( 'Category' );
var Trail		= mongoose.model( 'Trail' );

/*
 * Category CRUD
 */
exports.createCategory = function (req, res, next) {
  new Category({
    name    : req.body.catName,
	icon	: req.body.icon
  }).save( function( err, category, count ){
	if( err ) return next( err );
    res.redirect( '/admin' );
  });
};

exports.getCategories = function (req, res, next) {
	Category.find( function ( err, categories, count ) {
		if( err ) return next( err );
		res.send(categories);
	});
};

exports.getCategory = function (req, res, next) {
	Category.findById( req.params.id, function ( err, category ){
		if( err ) return next( err );
		res.redirect(category);
    });
};

exports.deleteCategory = function (req, res, next) {
	Category.findById( req.params.id, function ( err, category ){
		if( err ) return next( err );
		category.remove( function ( err, category ){
			if( err ) return next( err );
			res.redirect( '/admin' );
		});
    });
};

exports.editCategory = function (req, res, next) {
	Category.find( function ( err, categories ){
		if( err ) return next( err );
	
		Trail.
		find({}).
		populate('cat').
		sort('uid').
		sort({date: 'desc'}).
		exec( function( err, trails, count ) {
			if( err ) return next( err );
			res.render( 'admin', {
				title : 'Love Trail Admin',
				categories : categories,
				trails 	: trails,
				current: req.params.id,
				edit	: true
			});
		});
	});
};

// redirect to index when finish
exports.updateCategory = function (req, res, next){
	console.log(JSON.stringify(req.body));
	Category.findById( req.params.id, function ( err, category ){
		if( err ) return next( err );
		category.name    = req.body.catName;
		category.icon	 = req.body.icon;
		category.save( function ( err, category, count ){
			if( err ) return next( err );
			res.redirect( '/admin' );
		});
	});
};

/*
 * Trail CRUD
 */
exports.deleteUserTrail = function (req, res, next) {
	Trail.findById( req.params.id, function ( err, trail ){
		if( err ) return next( err );
		trail.remove( function ( err, trail ){
			if( err ) return next( err );
			res.redirect( '/admin' );
		});
    });
};

exports.deleteTrails = function (req, res, next) {
	Trail.find({ uid: req.params.uid }, function ( err, trails, count) {
		if( err ) return next( err );
		trails.forEach( function (trail) {
			trail.remove( function (err, trail) {
				if( err ) return next( err );	
			});	
		});
		res.redirect('/admin');
	});
};
/*
 * File functions
 */
exports.getFileList = function(req, res){

	var files 		= [];

	// Walker options
	var walker  = walk.walk('./public/images/marker', { followLinks: false });

	walker.on('file', function(root, stat, next) {
		// Add this file to the list of files
		files.push(root + '/' + stat.name);
		next();
	});

	walker.on('end', function() {
		//console.log(files); //DEBUG
		res.send(files);
	});
	
	
};

exports.upload = function(req, res, next) {

	console.log(JSON.stringify(req.files));

	fs.readFile(req.files.image.path, function (err, data) {
		if( err ) return next( err );

		var imageName = req.files.image.name

		/// If there's an error
		if(!imageName){

			console.log("There was an error")
			res.send("Upload error");
			res.end();

		} else {

		  var newPath = path.join(__dirname, "../public/images/marker/" + imageName);
		  
		console.log(newPath);

		  fs.writeFile(newPath, data, function (err) {
			if( err ) return next( err );

		  	/// let's see it
		  	res.send("Successfully uploaded " + imageName);

		  });
		}
	});
};

exports.remove = function(req, res, next) {
	
	var newPath = path.join(__dirname, "../public/" + req.body.path);

	fs.unlink(newPath, function (err) {
		if( err ) return next( err );
		console.log("successfully deleted "+req.body.path);
		res.send("Successfully deleted "+req.body.path);
	});
	
};
