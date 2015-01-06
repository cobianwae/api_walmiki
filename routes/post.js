var mongoose = require( 'mongoose' );
var Post = mongoose.model( 'Post' );
var Tag = mongoose.model( 'Tag' );
var Brand = mongoose.model( 'Brand' );
var User = mongoose.model( 'User' );

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
      brand.name = req.body.brands[i].brand;
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
      post.taggedUsers.push(mongoose.Types.ObjectId(req.body.taggedUsers[i]));
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

exports.getPosts = function(req, res) {
  User.findById(req.query.userId, function(err, user){
    if(err)
      res.send({success: false, error: err, message: 'can not load posts because user is not found'});


    Post.find({author: user}, function(err, post){
      if(err)
        res.send({success: false, error: err, message: 'can not load posts'});

      res.send(post);
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

