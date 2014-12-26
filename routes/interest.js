var mongoose = require('mongoose');
var User = mongoose.model('User');

exports.doUpdate = function(req, res){  
  User.findById(req.user.id, function(err, user){
    if(err)
      res.send(err);
    
    user.interests = [];
    
    for(var i in req.body.interests) {
      if(user.interests.indexOf(req.body.interests[i]) == -1) {
        user.interests.push(req.body.interests[i]);
      }        
    }

    user.save(function(saveErr, updatedUser){
      if(saveErr)
        res.send(saveErr);
      //return recommended user;
      res.send({success:true, message: 'success add interests', interests: updatedUser.interests });
    });
  });
};