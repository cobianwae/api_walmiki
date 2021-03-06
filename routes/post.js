var mongoose = require( 'mongoose' );
var Post = mongoose.model( 'Post' );
var Tag = mongoose.model( 'Tag' );
var User = mongoose.model( 'User' );
var Brand = mongoose.model( 'User' );


var isEmptyObject = function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return true;
};

exports.doCreate = function(req, res, next){
  if(isEmptyObject(req.body))
    return res.status(403).send('Bad Request');
  if(!req.body.title || req.body.title.trim() == '')
    return res.status(403).send({success:false, message:'Titile is required', field:'title'});
  if(!req.body.image || req.body.image.trim() == '')
    return res.status(403).send({success:false, message:'Image is required', field:'image'});
  var post = new Post();
  var newBrands = [];
  var newBrandCoordinates = [];
  var newTags = [];
  post.author = req.user.id;
  post.title = req.body.title;
  post.image = req.body.image;
  for (var i in req.body.brands){
    if ( mongoose.Types.ObjectId.isValid(req.body.brands[i].brand) ){
      post.brands.push({
        brand : req.body.brands[i].brand,
        coordinate : req.body.brands[i].coordinate
      });
    }else{
      var brand = {};
      brand.fullname = req.body.brands[i].brand;
      brand.username = 'lb_' + new mongoose.Types.ObjectId();
      brand.email = brand.username + '@lookats.com';
      brand.password = 'lookatsawsome6414';
      brand.type = 'brand';
      newBrands.push(brand);
      newBrandCoordinates[req.body.brands[i].brand] = req.body.brands[i].coordinate;
    }
  }
  for(var i in req.body.tags){
    if(mongoose.Types.ObjectId.isValid(req.body.tags[i])) {
      post.tags.push(req.body.tags[i]);
    }else{
      var tag = {};
      tag.name = req.body.tags[i];
      newTags.push(tag);
    }
  }
  for(var i in req.body.taggedUsers){
    if(mongoose.Types.ObjectId.isValid(req.body.taggedUsers[i])){
      post.taggedUsers.push(req.body.taggedUsers[i]);
    }
  }
  if(newTags.length == 0 && newBrands.length == 0){
    post.save(function (err, post) {
      if (err)
        return next(err);
      res.send({success:true});
    });
  }else if (newBrands.length != 0 && newTags.length != 0){
    Tag.collection.insert(newTags, function(err, tags){
      if(err)
        return next(err);
      for(var i in tags){
        post.tags.push(tags[i]._id);
      }
      Brand.collection.insert(newBrands, function(err, brands){
        if(err)
          return next(err);
        for(var i in brands){
          post.brands.push({
            brand : brands[i]._id,
            coordinate : newBrandCoordinates[brands[i].name]
          });
        }
        post.save(function (err, post) {
          if (err)
            return next(err);
          res.send({success:true});
        });
      });
    });
  }else if (newBrands.length != 0 && newTags.length == 0){
    Brand.collection.insert(newBrands, function(err, brands){
      if(err)
        return next(err);
      for(var i in brands){
        post.brands.push({
          brand : brands[i]._id,
          coordinate : newBrandCoordinates[brands[i].name]
        });
      }
      post.save(function (err, post) {
        if (err)
          return next(err);
        res.send({success:true});
      });
    });
  }else{
    Tag.collection.insert(newTags, function(err, tags){
      if(err)
        return next(err);
      for(var i in tags){
        post.tags.push(tags[i]._id);
      }
      post.save(function (err, post) {
        if (err)
          return next(err);
        res.send({success:true});
      });
    });
  }
};

exports.getById = function(req, res, next){
  Post.findOne({_id : req.params.id},function(err, post){
    if (err)
      return next(err);
    if(!post)
      return res.status(404).send('No page found');
    res.send(post);
  }).populate('comment.author');
};

exports.getPosts = function(req, res, next) {
  if(!req.query)
    return res.status(404).send({success:false, message:'the page is not found, query params is needed to load posts'});

  var userId;
  if(req.query.userId) {
    userId = req.query.userId;
  }

  if (req.query.wishedBy) {
    userId = req.query.wishedBy;
  }

  if(req.query.taggedUser) {
    userId = req.query.taggedUser;
  }

  User.findById(userId, function(err, user) {
    if(err)
      return next(err);
    if(!user)
      return res.status(404).send({success:false, message:'this user is no longer exist'});

    var queryParam = {};
    var sort = {};
    var andConditions = [];
    if(req.query.userId) {
      andConditions.push({author: user});
    }

    if(req.query.wishedBy) {
      andConditions.push({wished: {$in : [req.query.wishedBy]} });
    }

    if(req.query.taggedUser) {
      andConditions.push({taggedUsers: {$in : [req.query.taggedUser]} });
    }

    if(req.query.likedNumber) {
      sort = {likedNumber: req.query.likedNumber };
      andConditions.push({ likedNumber: {$gt : 0 } });
    } else {
      sort = {createdOn: -1 };
    }

    queryParam.$and = andConditions;
    Post.find(queryParam)
      .populate('author')
      .sort( sort )
      .exec(function(err, posts){
        if(err) return next(err);
        if(!posts)
          return res.status(404).send({success:false, message:'the post is no longer exist'});

        res.send({success: true, posts: posts});
      });
  });
};

exports.doLike = function(req, res, next){
  Post.findById(req.params.id , function(err, post){
    if(err)
      return next(err);
    if(!post)
      return res.status(404).send({success:false, message:'the post is no longer exist'});
    if(post.liked.indexOf(req.user.id) !== -1)
      return res.status(201).send({success:false, message:'the post is already been liked by you'});
    post.liked.push(req.user.id);
    post.likedNumber += 1;
    post.save(function(err, post){
      if(err)
        return next(err);
      res.send({success : true, likedNumber:post.likedNumber});
    });
  });
};

exports.doRepost = function(req, res, next){
  Post.findById(req.params.id, function(err, post){
    if(err)
      return next(err);
    if(!post)
      return res.status(404).send({success:false, message: 'the post is no longer exist'});
    if(post.reposted.indexOf(req.user.id) !== -1)
      return res.status(201).send({success:false, message: 'the post is already reposted by you'});
    post.reposted.push(req.user.id);
    post.repostedNumber += 1;
    post.save(function(err, post){
      if(err)
        return next(err);
      var newPost = new Post();
      newPost.title = post.title;
      newPost.image = post.image;
      newPost.author = req.user.id;
      newPost.originalPost = post._id;
      newPost.save(function(err, newPost){
        if(err)
          return next(err);
        res.send({success:true, repostedNumber : post.repostedNumber});
      });
    });
  });
};

exports.doReport = function(req, res, next){
  Post.findById(req.params.id , function(err, post){
    if(err)
      return next(err);
    if(!post)
      return res.status(404).send({success:false, message:'the post is no longer exist'});
    post.isActive = false;
    post.save(function(err, post){
      if(err)
        return next(err);
      res.send({success : true});
    });
  });
};

exports.getRepostUsers = function(req, res, next){
  Post.findById(req.params.id, function(err, post){
    if(err)
      return next(err);
    if(!post)
      return res.status(404).send({success:false, message:'the post is no longer exist'});
    var users = [];
    var queryParam = {};
    var andConditions = [];
    if(req.query.before){
      andConditions.push({createdOn : {$lt : new Date(req.query.before) }});
    }
    if(req.query.after){
      andConditions.push({createdOn : {$gt : new Date(req.query.after) }});
    }
    if(andConditions.length === 0){
      queryParam.originalPost = req.params.id;
    }else{
      andConditions.push({originalPost:req.params.id});
      queryParam.$and = andConditions;
    }
    Post.find(queryParam)
    .populate('author')
    .sort({createdOn : -1})
    .limit(10)
    .exec(function(err, posts) {
      if(err)
        return next(err);
      for(var i in posts) {
        users.push({
          _id : posts[i].author._id,
          username : posts[i].author.username,
          fullname : posts[i].author.fullname,
          avatar : posts[i].author.avatar,
          repostedOn : posts[i].createdOn,
          isFriend : posts[i].author.followers.indexOf(req.user.id) !== -1
        });
      }
      res.send(users);
    });
  });
};

exports.doWish = function(req, res, next){
  Post.findById(req.params.id , function(err, post){
    if(err)
      return next(err);
    if(!post)
      return res.status(404).send({success:false, message:'the post is no longer exist'});
    if(post.liked.indexOf(req.user.id) !== -1)
      return res.status(201).send({success:false, message:'the post is already been liked by you'});

    User.findById(post.author, function(err, user){
      if(user.type !== 'brand')
        return res.status(201).send({success:false, message:'wishlist only allowed for brands product'});

      post.wished.push(req.user.id);
      post.wishedNumber += 1;
      post.save(function(err, post){
        if(err)
          return next(err);
        res.send({success : true, wishedNumber:post.wishedNumber});
      });
    });

  });
};

exports.getWishList = function(req, res, next) {

  User.findById(req.params.id, function(err, user){
    if(err)
      return next(err);

    if(!user)
      return res.status(404).send({success:false, message:'the user is no longer exist'});

    var queryParam = {};
    var andConditions = [];
    andConditions.push({wished: {$in : [user._id]} });
    queryParam.$and = andConditions;
    Post.find(queryParam)
    .exec(function(err, posts){
      if (err)
        return next(err);

      res.send({success : true, posts: posts});
    });
  });

};

exports.getLikeUsers = function(req, res, next) {
  if(!req.params.id)
      return res.status(404).send({success:false, message:'the post is not found'});

  Post.findById(req.params.id)
    .populate('liked')
    .sort({createdOn : -1})
    .limit(10)
    .exec(function(err, post) {
      if(err)
        return next(err);
      if(!post)
        return res.status(404).send({success:false, message:'the post is no longer exist'});
      var users = [];
      for(var i=0;i<post.liked.length;i++) {
        users.push({
          _id : post.liked[i]._id,
          username : post.liked[i].username,
          fullname : post.liked[i].fullname,
          avatar : post.liked[i].avatar,
          repostedOn : post.liked[i].createdOn,
          isFollowing : post.liked[i].followers.indexOf(req.user.id) !== -1
        });
      }
      res.send(users);
    });

};

