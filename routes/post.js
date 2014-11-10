var mongoose = require( 'mongoose' );
var Post = mongoose.model( 'Post' );
var Tag = mongoose.model( 'Tag' );
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var mime = require('mime');
// var ObjectID = require('mongoose').Types.ObjectID;

exports.doCreate = function(req, res){
	var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
      var imagePath = files.image[0].path;
      var post = new Post;
      	post.title = files.title;
     //  	for(var i in files.brands){
	    //   	if(ObjectID.isValid(files.brands[i])){
	    //   		post.brands.push(ObjectID(files.brands[i]));
	    //   	}else{
	    //   		var brand = new Tag();
	    //   		tag.name = files.brands[i];
	    //   		tag.save(function(tagError, tag){
	    //   			if ( tagError )
	    //   				res.send(tagError);
	    //   			post.tags.push(tag._id);
	    //   		});
	    //   	}
	    // }
      	for(var i in files.tags){
	      	if(ObjectID.isValid(files.tags[i])){
	      		post.tags.push(files.tags[i]);
	      		// post.tags.push(ObjectID(files.tags[i]));
	      	}else{
	      		var tag = new Tag();
	      		tag.name = files.tags[i];
	      		tag.save(function(tagError, tag){
	      			if ( tagError )
	      				res.send(tagError);
	      			post.tags.push(tag._id);
	      		});
	      	}
	    }
	    for(var i in files.tagedUsers){
	    	if(ObjectID.isValid(files.tagedUsers[i])){
	    		post.tagedUsers.push(files.tagedUsers[i]);
	      		// post.tagedUsers.push(ObjectID(files.tagedUsers[i]));
	      	}
	    }
      	// post.tagedUsers = files.tagedUsers;
	    post.image.data = fs.readFileSync(imagePath);
	    post.image.contentType = mime.lookup(imagePath);
	    post.save(function (postErr, post) {
	      if (postErr)
	      	res.send(postErr);
	  	  res.send(post);
	  	});
    });
}