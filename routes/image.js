var mongoose = require( 'mongoose' );
var Image = mongoose.model( 'Image' );

exports.getImageById = function(req, res){
	console.log(req.params);
	Image.findById(req.params.id, function(err, image){

		if (err) res.send(err);
          res.contentType(image.contentType);
          res.send(image.data);
	});
};