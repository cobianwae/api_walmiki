var mongoose = require( 'mongoose' );
var Post = mongoose.model( 'Post' );
var User = mongoose.model( 'User' );

exports.getTimeline = function(req, res, next){
  User.findOne({_id:req.user.id},function(err,user){
    var queryParam = {};
    var andConditions = [];
    var orConditions = [];
    orConditions.push({author : req.user.id});
    orConditions.push({author : {$in : user.following}});
    if(req.query.before){
      andConditions.push({createdOn : {$lt : new Date(req.query.before) }});
    }
    if(req.query.after){
      andConditions.push({createdOn : {$gt : new Date(req.query.after) }});
    }
    andConditions.push({$or : orConditions});
    queryParam.$and = andConditions;
    console.log(queryParam);
    Post.find(queryParam)
    .populate('author', '_id username avatar')
    .sort( { createdOn: -1 } )
    .limit(10)
    .exec(function(err, posts){
      if (err)
        return next(err);
      res.send(posts);
    });
  });
};
