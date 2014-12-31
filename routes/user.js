var mongoose = require('mongoose');
var User = mongoose.model('User');
var Post = mongoose.model('Post');
var jwt = require('jsonwebtoken');

exports.authenticate = function(req, res, next) {
  var condition = { username: req.body.username };
  var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;  
  if (emailRegex.test(req.body.username)) {
    condition = { email: req.body.username };
  }

  User.findOne(condition, function (err, user) {
    if (err)
      return next(err);
    if (!user)
      return res.status(400).send({success:false, message:'Username is not registered', field:'username'});
    user.verifyPassword(req.body.password, function(err, isMatch) {
      if (err)
        return next(err);
      if (!isMatch)
        return res.status(400).send({success:false, message:'The password is incorrect', field:'password'});
      var profile = {
        email: user.email,
        id: user._id
      };
      //the secret key should be placed in configuration file
      var token = jwt.sign(profile, 'lookats-05112014162539');
      res.send({success:true, token: token });
    });
  });
};

exports.getById = function(req, res, next){
   User.findOne({_id : req.params.id})
  .exec(function (err, user) {
    if(err)
      return next(err);
    if(!user)
      return res.status(404).send('Page Not Found');
    var userDTO = {};
    userDTO.avatar =  user.avatar;
    userDTO.id = user.id;
    userDTO.username = user.username;
    userDTO.fullname = user.fullname;
    userDTO.description = user.description;
    userDTO.website = user.website;
    userDTO.followers = user.followers.length;
    userDTO.following = user.following.length;
    userDTO.isSelf = req.params.id === req.user.id;
    userDTO.areYouFollowHim = user.followers.indexOf(req.user.id) != -1;
    userDTO.isYourFollower = user.following.indexOf(req.user.id) != -1;
    userDTO.cover = 'http://localhost:9090/api/images/54745c8914f028c416e8d4e8';
    var userPost = Post.aggregate([
      {$match : { author : user._id }},
      {$group : {
        _id : "$author",
        liked :{ $sum : "$likedNumber" },
        reposted : { $sum: "$repostedNumber" },
        count : { $sum : 1 }
      }
      }
    ],function(err, postStats){
      if (err)
        return next(err);
      if(postStats.length){
        userDTO.liked = postStats[0].liked;
        userDTO.reposted = postStats[0].reposted;
        userDTO.postCount = postStats[0].count;
      }
      var taggedPost = Post.aggregate([
        { $match : { taggedUsers : { $in : [user._id] } } },
        { $group : {
          _id : null,
          count : { $sum : 1 }
        } }
      ], function(err, posts){
        if (err)
           return next(err);
        if (posts.length)
          userDTO.tagged = post[0].count;
        res.send(userDTO);
      });
    });
  });
};

exports.doCreate = function(req, res, next){
  var newUser  = new User();
  newUser.email = req.body.email;
  newUser.username = req.body.username;
  newUser.password = req.body.password;
  newUser.fullname = req.body.fullname;
  newUser.phoneNumber = req.body.phoneNumber;
  newUser.save( function( err, user ){
    if(err){
      if (err.code == 11000){
        var regex = /\$((\w+))_/ig;
        var field = err.err.match(regex)[0]
        field = field.substring(1, field.length-1);
        return res.status(409).send({success:false, message:field + ' is already registered', field: field});
      }
      return next(err);
    }
    res.json({success:true});
  });
};

exports.doUpdate =  function(req, res){
  User.findById(req.user.id, function(err, user){
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

exports.getUsers = function(req, res){
  var queryParam = {_id : {$ne : req.user.id}};
  if (req.query.fullname){
      var regex = new RegExp(req.query.fullname, 'i');
      queryParam = {$and : [ {fullname : regex}, {_id : {$ne : req.user.id}} ]};
  }
  User.find(queryParam)
  .select('_id fullname avatar username')
  .exec(function(err, users){
    if(err)
      res.send(err);
    res.send(users);
  });
};
