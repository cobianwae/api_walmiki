var mongoose = require( 'mongoose' );
var User = mongoose.model( 'User' );
var Post = mongoose.model( 'Post' );
var Tag = mongoose.model( 'Tag' );
var Image = mongoose.model( 'Image');
var jwt = require('jsonwebtoken');

exports.doCreate = function(req, res){
	var newUser  = new User();
	for(var prop in req.body){
		if(req.body.hasOwnProperty(prop)){
			newUser[prop] = req.body[prop];
		}
	}
	newUser.save( function( err, user ){
		if(err)
			res.send(err);
		res.json(user);
	});
};

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
			doRecommendUser(req, res);
		});
	});
};

exports.getUsers = function(req, res){
  console.log(req.params.fullname);
  var regex = new RegExp(req.params.fullname, 'i');
  User.find({$and : [ {fullname : regex}, {_id : {$ne : req.user.id}} ]})
  .select('_id fullname')
  .exec(function(err, users){
    if(err)
      res.send(err);
    res.send(users);
  });
};

var doRecommendUser = function(req, res){
	var page = req.body.page ? req.body.page : 1;
	var limit = 10;
	var skip = (page - 1) * limit;
	var originResults = [];
	var skipUsers = []
	User.findById(req.user.id, function(err, user){
		skipUsers.push(user._id);
		Tag.find({name : {$in : user.interests}}, function(err, tags){
			var tagIds = [];
			for(var i in tags){
				tagIds.push(tags[i]._id);
			}
			Post.aggregate([
				{$match : { $and : [{tags: { $in: tagIds }},{author : {$nin : skipUsers}}]} },
				{$group : {
					_id : "$author",
					liked :{ $sum : "$likedNumber" }
					}
				},
				{$sort : { liked : -1 } },
				{$skip : skip },
				{$limit : limit }
			],function(aggErr, result){
				if (aggErr)
					res.send(aggErr);
				User.populate(result,{
					path : "_id",
				}, function(err, result){
					Image.populate(result, {
						path : "_id.avatar"
					}, function(err, result){
						for(var i in result){
							originResults.push({
								id : result[i]._id._id,
								username : result[i]._id.username,
								avatar : result[i]._id.avatar

							});
							skipUsers.push(result[i]._id._id);
						}
						if(result.length < limit){
							limit = limit-result.length;
							User
							.find({ $and : [{ interests :{$in : user.interests}}, {_id : {$nin : skipUsers }} ] })
							.populate('avatar')
							.skip((page-1) * limit)
							.limit(limit)
							.exec(function(err, users){
								if (err)
									res.send(err);
								for(var i in users){
									originResults.push({
										id : users[i]._id,
										username : users[i].username,
										avatar : users[i].avatar
									});
									skipUsers.push(users[i]._id);
								}
								if (users.length < limit){
									limit = limit-users.length;
									skip = (page-1) * limit;
									User
									.find({_id : {$nin : skipUsers}})
									.populate('avatar')
									.exec(function(err, randUsers){
										for(var i in randUsers){
											originResults.push({
												id : randUsers[i]._id,
												username : randUsers[i].username,
												avatar : randUsers[i].avatar
											});
										}
										res.send(originResults);
									});
								}else{
									res.send(originResults);
								}
							});
						}else{
							res.send(originResults);
						}
					});
				});
			});
		});
	});
};

exports.doUpdate =  function(req, res){
	User.findById(req.params.user_id, function(err, user){
		if(err)
			res.send(err);
		for(var prop in req.body){
			if(req.body.hasOwnProperty(prop)){
				user[prop] = req.body[prop];
			}
		}
		user.save(function(saveErr, updatedUser){
			if(saveErr)
				res.send(saveErr);
			res.json(updatedUser);
		});
	});
};

exports.authenticate = function(req, res){
	console.log('oi');
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
};

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
};

exports.getTimeline = function(req, res){
  User.findById(req.user.id, function(err, user){
    if (err)
      res.send(err);
    Post.find({author : {$in : user.following } })
    .populate('avatar')
    .exec(function(err, posts){
      if (err)
        res.send(err);
      Image.populate(posts,{
      });
    });
  });
};

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
};

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
};
