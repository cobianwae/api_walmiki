var mongoose = require( 'mongoose' );
var Post = mongoose.model( 'Post' );
var Tag = mongoose.model( 'Tag' );
var Brand = mongoose.model( 'Brand' );
var multiparty = require('multiparty');
var fs = require('fs');
var mime = require('mime');
var Image = mongoose.model( 'Image' );
//var gm = require('gm');
var gm = require('gm').subClass({ imageMagick: true });
// var imageMagick = gm.subClass({ imageMagick: true });

exports.doCreate = function(req, res){	
	var post = new Post();
	post.author = req.user.id;
	post.title = req.body.title;
	var imageId = req.body.image;
	post.image = mongoose.Types.ObjectId(imageId);
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
    console.log(files);
		for(var i in files.image){
			var imagePath = files.image[i].path;
			var image = new Image();
			image.contentType = mime.lookup(imagePath);
		    image.filename = files.image[i].originalFilename;
			image.data = fs.readFileSync(imagePath);
			gm(imagePath)
			.resize(1000)
			.quality(50)
			.toBuffer('jpg', function (err, buffer) {
				console.log(err);
			  if (err)
			  	res.send(err);
			  image.data = buffer;
			  image.save(function (imageError, image){
			    	if(imageError)
			    		res.send(imageError);
			    		//results.errors.push({ filename :files.image[i].originalFilename });
			    	else
			    		res.send(image._id);
			    		//results.success.push({ id : image._id, data : image.data, filename : image.filename, contentType:image.contentType });

			    	/*if(i == files.image.length -1 )
			    		res.send(results);*/
		   	  });
			});


		}
	});
}

exports.doLike = function(req, res){
	Post.findById(req.body.postId , function(error, post){
		post.liked.push(mongoose.Types.ObjectId(req.user.id));
		post.likedNumber = post.liked.length;
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
		post.repostedNumber = post.reposted.length;
		post.save(function(saveErr, post){
			if(saveErr){
				res.send(saveErr);
			}
			var newPost = new Post();
			newPost.title = post.title;
			newPost.image = post.image;
			newPost.author = req.user.id;
			newPost.originalPost = post._id;
			newPost.save(function(newErr, post){
				if(newErr){
					res.send(newErr);
				}
				res.send(post);
			});
		});
	});
}

exports.getMostLikedPosts = function(req, res){
	Post.find({$and : [{author : req.user.id}, {originalPost : null}]})
	.populate('author', '_id username avatar')
	.populate('taggedUsers', '_id username avatar')
	.populate('tags', '_id, name')
	.limit(10)
	.sort({likedNumber : -1})
	.select('title image author taggedUsers tags')
	.exec(function(err, posts){
		Image.populate(posts,{
			path : 'author.avatar'
		},function(err, posts){
			Image.populate(posts, {
				path : 'taggedUsers.avatar'
			}, function(err, posts){
				res.send(posts);
			});
		});
	});
}

exports.getRecentPostsByUserId = function(req, res){
	Post.find({author:req.params.id})
	.populate('author', '_id username avatar')
	.sort({createdOn : 1})
	.exec(function(err, posts) {
		if (err) {
			res.send(err);
		}

		res.send(posts);
		/*Image.populate(posts, { path: 'author.avatar' }, function(err, posts) {
			Image.populate(posts, { path: ''			});
		});*/
	});
}

exports.getRecentPosts = function(req, res){
	Post.find({author:req.user.id})
	.populate('author', '_id username avatar')
	.sort({createdOn : 1})
	.exec(function(err, posts) {
		if (err) {
			res.send(err);
		}

		res.send(posts);
		/*Image.populate(posts, { path: 'author.avatar' }, function(err, posts) {
			Image.populate(posts, { path: ''			});
		});*/
	});
}
