var mongoose = require( 'mongoose' );
var Tag = mongoose.model( 'Tag' );

exports.getTags = function(req, res){
  var regex = new RegExp(req.params.name, 'i');
  Tag.find({name: regex}, function(error, tags){
    if(error)
      res.send(error);
    res.send(tags);
  });
};
