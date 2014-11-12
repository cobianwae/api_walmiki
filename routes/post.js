var mongoose = require( 'mongoose' );
var Post = mongoose.model( 'Post' );
var Tag = mongoose.model( 'Tag' );
var Brand = mongoose.model( 'Brand' );
var multiparty = require('multiparty');
var fs = require('fs');
var mime = require('mime');
var Image = mongoose.model( 'Image' );

exports.doCreate = function(req, res){
	var post = new Post();
	post.author = req.user.id;
	post.title = req.body.title;
	post.image = mongoose.Types.ObjectId(req.body.image);
	for (var i in req.body.brands){
		if ( mongoose.Types.ObjectId.isValid(req.body.brands[i].brand) ){
			post.brands.push({
				brand : req.body.brands[i].brand,
				coordinate : req.body.brands[i].coordinate
			});
		}else{
			var brand = new Brand();
			brand.name = req.body.brands[i].brand;
			var coordinate = req.body.brands[i].coordinate;
			brand.save(function(brandError, brand){
				if(brandError)
					res.send(brandError);
				post.brands.push({
					brand : brand._id,
					coordinate : coordinate
				})
			});
		}
	}
	for(var i in req.body.tags){
      	if(mongoose.Types.ObjectId.isValid(req.body.tags[i])) {
      		post.tags.push(mongoose.Types.ObjectId(req.body.tags[i]));
      	}else{
      		var tag = new Tag();
      		tag.name = req.body.tags[i];
      		tag.save(function(tagError, tag){
      			if ( tagError )
      				res.send(tagError);
      			post.tags.push(tag._id);
      		});
      	}
    }
 	for(var i in req.body.taggedUsers){
    	if(mongoose.Types.ObjectId.isValid(req.body.taggedUsers[i])){
      		post.taggedUsers.push(mongoose.Types.ObjectId(req.body.taggedUsers[i]));
      	}
    }
    post.save(function (postErr, post) {
      if (postErr)
      	res.send(postErr);
  	  res.send(post);
  	});
}

exports.doUploadImage = function(req, res){
	var form = new multiparty.Form();
	var results = {
			success : [],
			errors : []
		};
	form.parse(req, function(err, fields, files) {
		
		for(var i in files.image){
			var imagePath = files.image[i].path;
			var image = new Image();
			image.data = fs.readFileSync(imagePath);
		    image.contentType = mime.lookup(imagePath); 
		    image.filename = files.image[i].originalFilename;
		    image.save(function (imageError, image){
		    	if(imageError)
		    		results.errors.push({ filename :files.image[i].originalFilename });
		    	else
		    		results.success.push({ id : image._id, data : image.data, filename : image.filename, contentType:image.contentType });
		    	if(i == files.image.length -1 )
		    		res.send(results);
		    });
		}
	});
}

exports.doLike = function(req, res){
	Post.findById(req.body.postId , function(error, post){
		post.liked.push(mongoose.Types.ObjectId(req.user.id));
		post.save(function(postErr, post){
			if (postErr){
				res.send(postErr);
			}
			res.send({success : true});
		});
	});
}

exports.doRepost = function(req, res){
	Post.findById(req.body.postId, function(error, post){
		post.reposted.push(mongoose.Types.ObjectId(req.user.id));
		post.save(function(saveErr, post){
			if(saveErr){
				res.send(saveErr);
			}
			var newPost = new Post();
			// newPost.
		});
	});
}

