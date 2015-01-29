var mongoose = require( 'mongoose' );
var Tag = mongoose.model( 'Tag' );

exports.getTags = function(req, res, next){
  if(!req.query || req.query.name === '')
    return res.send([]);
  var regex = new RegExp(req.query.name, 'i');
  Tag.find({name: regex}, function(error, tags){
    if(error)
      return next(error);
    res.send(tags);
  });
};
