var mongoose = require( 'mongoose' );
var Brand = mongoose.model( 'Brand' );

exports.getBrands = function(req, res){
  var regex = new RegExp(req.params.name, 'i');
  Brand.find({name: regex}, function(error, brands){
    if(error)
      res.send(error);
    res.send(tags);
  });
};
