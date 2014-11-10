var mongoose = require( 'mongoose' );
var User = mongoose.model( 'User' );
var Post = mongoose.model( 'Post' );
var jwt = require('jsonwebtoken');
var multiparty = require('multiparty');
// var Busboy = require('busboy');
var util = require('util');
// var path = require('path');
// var os = require('os');
// var fs = require('fs');

exports.doCreate = function(req, res){
	var newUser  = new User();
	newUser.username = req.body.username;
	newUser.email = req.body.email;
	newUser.password = req.body.password;
	newUser.fullname = req.body.fullname;
	newUser.save( function( err, user ){
		if(err)
			res.send(err);
		res.json(user);
	});
}

exports.doUpdateInterests = function(req, res){
	User.findById(req.user.id, function(err, user){
		if(err)
			res.send(err);
		for(var i in req.body.interests){
			if(user.interests.indexOf(req.body.interests[i]) == -1)
				user.interests.push(req.body.interests[i]);
		}
		user.save(function(saveErr, updatedUser){
			if(saveErr)
				res.send(saveErr);

			//return recommended user;
			// User.find({interests : })
			var recommendedUser = Post.aggregate([
				{$match : { tags: { $in: user.interests } }},
			  	{$unwind: "$tags"}, 
			  	{$match : { tags: { $in: user.interests } }},
				{$group : { 
					_id : "$createdBy", 
					liked :{ $sum : { $size : "$liked" } } 
					}
				}
			],function(aggErr, result){
				if (aggErr)
					res.send(aggErr);
				res.json(result);
			});
		});
	});
}

exports.doRecommendUser = function(req, res){
	var recommendedUser = Post.aggregate([
		{$match : { tags: { $in: user.interests } }},
	  	{$unwind: "$tags"}, 
	  	{$match : { tags: { $in: user.interests } }},
		{$group : { 
			_id : "$createdBy", 
			liked :{ $sum : { $size : "$liked" } } 
			}
		}
	],function(aggErr, result){
		if (aggErr)
			res.send(aggErr);
		res.json(result);
	});
}

exports.doUpdate =  function(req, res){
	User.findById(req.params.user_id, function(err, user){
		if(err)
			res.send(err);
		user.firstName = req.body.firstName;
		user.lastName = req.body.lastName;
		user.avatar = req.body.avatar;
		user.save(function(saveErr, updatedUser){
			if(saveErr)
				res.send(saveErr);
			res.json(updatedUser);
		});
	});
	// var form = new multiparty.Form();

 //    form.parse(req, function(err, fields, files) {
 //      console.log(fields);
 //      console.log(files);
 //      res.writeHead(200, {'content-type': 'text/plain'});
 //      res.write('received upload:\n\n');
 //      res.end(util.inspect({fields: fields, files: files}));
 //    });

 //    return;

 //    return;
	// var uploadDir = './uploads';
 //  	var busboy = new Busboy({ headers: req.headers });
 //    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
 //      var saveTo = path.join(uploadDir,filename);
 //      console.log(saveTo);
 //      file.pipe(fs.createWriteStream(saveTo));
 //    });
 //    busboy.on('field', function(key, value, keyTruncated, valueTruncated) {

 //    });
 //    busboy.on('finish', function() {
 //      res.writeHead(200, { 'Connection': 'close' });
 //      res.end("That's all folks!");
 //    });
 //    return req.pipe(busboy);
	// User.findById(req.params.user_id, function(err, user){
	// 	if(err)
	// 		res.send(err);
	// 	user.firstName = req.body.firstName;
	// 	user.lastName = req.body.lastName;
	// 	user.avatar = req.body.avatar;
	// 	user.save(function(saveErr, updatedUser){
	// 		if(saveErr)
	// 			res.send(updatedUser);
	// 		res.json(updatedUser);
	// 	});
	// });
}

exports.authenticate = function(req, res){
	User.findOne({ username: req.body.username }, function (err, user) {
		console.log(req);
	      if (err || !user) { res.send(401, 'Wrong user or password'); }
		  user.verifyPassword(req.body.password, function(err, isMatch) {
	        if (err) { res.send(401, 'Wrong user or password'); }
	        if (!isMatch) { res.send(401, 'Wrong user or password'); }
	        var profile = {
			    email: user.email,
			    id: user._id
		  	};
	        var token = jwt.sign(profile, 'lookats-05112014162539');
	  		res.json({ token: token });
	      });
	});
}

exports.getById = function(req, res){
	User.findById(req.user.id, function(err, user){
		if(err)
			res.send(err);
		res.json(user);
	});
}