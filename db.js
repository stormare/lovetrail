var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
 
var Trail = new Schema({
    uid		: {type: String, required: true},
    lat   	: {type: Number, required: true},
	lon		: {type: Number, required: true},
	cat		: {type: Schema.ObjectId, ref: 'Category', required: true},
    date 	: {type: Date, required: true},
	desc	: {type: String, required: false},
	name	: {type: String, default: 'Your love trail', required: true}
});
 
mongoose.model( 'Trail', Trail );

var Category = new Schema({
	name	: {type: String, required: true},
	icon	: {type: String, required: true}
});

Category.pre('remove', function(next) {
	var t = mongoose.model( 'Trail' );
    t.remove({cat: this._id}).exec();
    next();
});

mongoose.model( 'Category', Category );
