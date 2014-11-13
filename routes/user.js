var mongoose = require( 'mongoose' );
var User = mongoose.model( 'User' );
var Post = mongoose.model( 'Post' );
var jwt = require('jsonwebtoken');

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
}

exports.authenticate = function(req, res){
	User.findOne({ username: req.body.username }, function (err, user) {
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
	User.findOne({_id : req.user.id})
	.populate('avatar')
	.exec(function (err, user) {
		if(err)
			res.send(err);
		var userViewModel = {};
		if(user.avatar != undefined){
			userViewModel.picture = {
				data : user.avatar.data,
				contentType : user.avatar.contentType
			}
		}
		userViewModel.username = user.username;
		userViewModel.fullname = user.fullname;
		userViewModel.description = user.description;
		userViewModel.website = user.website;
		userViewModel.followers = user.followers.length;
		userViewModel.following = user.following.length;
		var userPost = Post.aggregate([
			{$match : { author : user._id }},
			{$group : { 
					_id : "$author", 
					liked :{ $sum : "$likedNumber" },
					reposted : { $sum: "$repostedNumber" },
					count : { $sum : 1 } 
				}
			}
		],function(postErr, postStats){
			if (postErr){
				res.send(postErr);
			}
			if(postStats.length){
				userViewModel.liked = postStats[0].liked;
				userViewModel.reposted = postStats[0].reposted;
				userViewModel.postCount = postStats[0].count;
			}
			var taggedPost = Post.aggregate([
				{ $match : { taggedUsers : { $in : [user._id] } } },
				{ $group : {
					_id : null,
					count : { $sum : 1 }
				} }
			], function(taggedPostErr, post){
				if(taggedPostErr){
					res.send(taggedPostErr);
				}
				if(post.length){
					userViewModel.tagged = post[0].count;
				}
				res.send(userViewModel);
			});
		});
	});	
}

exports.doFollow = function(req, res){
	var followingId = req.body.userId;
	User.findById(req.user.id, function(err, user){
		if(err){
			res.send(err);
		}
		var following = mongoose.Types.ObjectId(followingId);
		user.following.push(following);
		user.save(function(followingErr, user){
			if(followingErr){
				res.send(followingErr);
			}
			var follower = user._id;
			User.findById(followingId, function(followerErr, user){
				if(followerErr){
					res.send(followerErr);
				}
				user.followers.push(follower);
				user.save(function(lastSaveError, user){
					if(lastSaveError){
						res.send(lastSaveError);
					}
					res.send({success:true});
				});
			});
		});

	});
}

exports.doUnfollow = function(req, res){
	User.findById(req.user.id, function(err, user){
		if(err){
			res.send(err);
		}
		var following = mongoose.Types.ObjectId(req.body.userId);
		var followingIndex = user.following.indexOf(following);
		if (followingIndex > -1){
			user.following.splice(followingIndex, 1);
		}
		user.save(function(userErr, user){
			if(userErr){
				res.send(userErr);
			}
			var follower = user._id;
			User.findById(following, function(err, user){
				if(err){
					res.send(err);
				}
				var followerIndex = user.followers.indexOf(follower);
				if(followerIndex > -1){
					user.followers.splice(followerIndex, 1);
				}
				user.save(function(err, user){
					if(err){
						res.send(err);
					}
					res.send({success : true});
				});
			});
		});

	});
}