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
      res.send({success:true, token: token, id: user._id });
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
    userDTO.cover = 'http://localhost:9090/api/images/54ae67fece094c542d926c59';    
    userDTO.about = user.about;
    userDTO.email = user.email;
    userDTO.phoneNumber = user.phoneNumber;
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
          userDTO.tagged = posts[0].count;
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
    res.json({success:true, id:user._id});
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

exports.doFollow = function(req, res, next){
  var toBeFollowed = req.params.id;
  User.findById(req.user.id, function(err, user){
    if(err)
      return next(err);
    User.findById(toBeFollowed, function(err, targetUser){
      if(err)
        return next(err);
      if(!targetUser)
        return res.status(404).send({success:false, message:'User is no longer exist'});
      if(user.following.indexOf(targetUser._id) !== -1)
        return res.status(201).send({success:false, message:'You have followed ' + targetUser.username });
      user.following.push(targetUser._id);
      user.save(function(err, user) {
        if(err)
          return next(err);
        targetUser.followers.push(user._id);
        targetUser.save(function (err, targetUser) {
          if(err)
            return next(err);
          res.send({success:true});
        });
      });
    });
    //     user.following.push(toBeFollowed);
    //     user.save(function(err, user){
    //       if(err)
    //         return next(err);
    //       var follower = user._id;
    //       User.findById(toBeFollowed, function(err, user){
    //         if(err)
    //           return next(err);
    //         user.followers.push(follower);
    //         user.save(function(err, user){
    //           if(err)
    //             return next(err);
    //           res.send({success:true});
    //         });
    //       });
    //     });
  });
};

exports.doUnfollow = function(req, res, next) {
  var unfollowedId = req.params.id;
  User.findById(req.user.id, function(err, user){
    if(err)
      return next(err);
    User.findById(unfollowedId, function(err, targetUser){
      if(err)
        return next(err);
      if(!targetUser)
        return res.status(404).send({success:false, message:'User is no longer exist'});      
      
      var index = user.following.indexOf(targetUser._id);
      if(index > -1) {
        user.following.splice(index, 1);

        user.save(function(err, user) {
        if(err)
          return next(err);
        
        var index = targetUser.followers.indexOf(user._id);
        if(index > -1) {
          targetUser.followers.splice(index, 1);
          targetUser.save(function (err, targetUser) {
          if(err)
              return next(err);
            res.send({success:true});
          });
        } else {
          return res.status(201).send({success:false, message:user.username + ' not founded in follower list'});    
        }
        
        });
      } else {
        return res.status(201).send({success:false, message:targetUser.username + ' not founded in following list'});
      }


    });
  });
};

exports.changePassword = function(req, res, next) {
  User.findById(req.user.id, function(err, user){
    if(err)
      return next(err);
    user.verifyPassword(req.body.currentPassword, function(err, isMatch){
      if (err)
        return next(err);
      if (!isMatch)
        return res.status(400).send({success:false, message:'The current password password is wrong', field:'currentPassword'});

      if(req.body.newPassword == req.body.confirmPassword) {
        user.password = req.body.newPassword;
        user.save(function(saveErr, updatedUser){
          if(saveErr)
            res.send(saveErr);
          res.send({success:true, message: 'success updated password' });
        });
        
      } else {
        return res.status(400).send({success:false, message:'The confirm password is not match with new password', field:'confirmPassword'});
      }
      
    });
  });
};
