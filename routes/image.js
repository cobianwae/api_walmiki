var mongoose = require( 'mongoose' );
var Image = mongoose.model( 'Image' );
var multiparty = require('multiparty');
var mime = require('mime');
var gm = require('gm');
//var gm = require('gm').subClass({ imageMagick: true });

exports.doCreate = function(req, res, next){
  var form = new multiparty.Form();
	var results = {
			success : [],
			errors : []
		};
	form.parse(req, function(err, fields, files) {
    if(!files || !files.image)
      return res.status(403).send('Bad Request');
		for(var i in files.image){
			var imagePath = files.image[i].path;
			var image = new Image();
			image.contentType = mime.lookup(imagePath);
		  image.filename = files.image[i].originalFilename;
			gm(imagePath)
			.resize(1000)
			.quality(100)
			.toBuffer('jpg', function (err, buffer) {
			  if (err)
			  	return next(err);
			  image.data = buffer;
			  image.save(function (imageError, image){
			    	if(imageError)
			    		results.errors.push({ filename :files.image[i].originalFilename });
			    	else
			    		results.success.push({ id : image._id, filename : image.filename });

			    	if(i == files.image.length -1 )
			    		res.send(results);
		   	  });
			});
		}
	});
};

exports.getById = function(req, res, next){
  Image.findById(req.params.id, function(err, image){
    if (err)
       return next(err);
    if(!image)
      return res.status(404).send('Page Not Found');
    res.contentType(image.contentType);
    res.send(image.data);
  });
};
