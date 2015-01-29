var mongoose = require('mongoose');
var User = mongoose.model('User');
var ChosenInterest = mongoose.model('ChosenInterest');

exports.doUpdate = function(req, res) {
  User.findById(req.user.id, function(err, user, next){
    if(err)
      return next(err);    
    var newInterests = req.body.interests.slice();
    var userInterests = []
    if(user.interests.length > 0){
       userInterests = user.interests.slice();
    } 
    
    ChosenInterest.find({interest: { $in: userInterests }}, function(err, interests){
      if(err)
        return next(err);

      for(var i=0;i < interests.length; i++) {
        interests[i].count -= 1;
        var idx = newInterests.indexOf(interests[i].interest);
        if(idx > -1){
          interests[i].count += 1;
          newInterests.splice(idx, 1);
        } 
        interests[i].save();
      }

      var currentInterests = [];
      for(var i=0; i < newInterests.length; i++) {
        currentInterests.push({interest: newInterests[i], count: 1});
      }

      
      if(currentInterests.length > 0) {
        ChosenInterest.find({interest: { $in: currentInterests.map(function(x){ return x.interest; }) }}, function(err, interests){
          for(var i=0; i<interests.length;i++) {
            var idx = currentInterests.map(function(x){ return x.interest; }).indexOf(interests[i].interest);            
            if(idx > -1) {
              currentInterests.splice(idx, 1);
              interests[i].count += 1;
              interests[i].save();
            }
          }

          ChosenInterest.collection.insert(currentInterests, function(err, newInterests){
            if(err)
              return next(err);
          });    
        });
        
      }
    });

    user.interests = [];
    for(var i=0;i<req.body.interests.length;i++) {
      user.interests.push(req.body.interests[i]);      
    }

    user.save(function(saveErr, updatedUser){
      res.send({success:true, message: 'success add interests', interests: updatedUser.interests });
    });
  });
};

exports.getInterests = function(req, res) {
  ChosenInterest
  .find({})
  .sort( { count: -1 } )
  .limit(10)
  .exec(function(err, interests){
    if (err)
      return next(err);
    
    res.send({success: true, interests: interests});
  });

};