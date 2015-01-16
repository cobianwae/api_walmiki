var mongoose = require('mongoose');
var Brand = mongoose.model('User');


exports.getBrands = function(req, res){
//   console.log("oi");
//   var queryParam = {$and : [{_id : {$ne : req.user.id}},{type : 'brand'} ]};
  if(!req.query.term){
    return res.send([]);
  }
    var regex = new RegExp(req.query.term, 'i');
    queryParam = {$and : [ {$or : [{fullname : regex}, {username : regex}]}, {_id : {$ne : req.user.id}}, {type : 'brand'} ]};

  Brand.find(queryParam)
  .select('_id fullname avatar username')
  .limit(20)
  .exec(function(err, users){
    if(err)
      res.send(err);
    res.send(users);
  });
};
