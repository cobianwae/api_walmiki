global.should = require('should');
global.assert = require('assert');
global.q = require('q');
global.db = require('../model/db');
global.mongoose = require('mongoose');
global.request = require('supertest')('http://localhost:7070/api');
global.clearDB = function(){
  for(var i in mongoose.connection.collections){
    mongoose.connection.collections[i].remove(function(){});
  }
};
global.initializeUser = function(){
  var deffered = q.defer();
  var User = mongoose.model('User');
  var user = new User();
  user.username = 'cobianwae';
  user.email = 'cobian.wae@gmail.com';
  user.fullname = 'Dikdik Fazzarudin';
  user.password = 'hagemaru6414';  
  user.save(function(err, user){
    deffered.resolve({username:user.username, password:'hagemaru6414'});
  });
  return deffered.promise;
};
global.initializeBrand = function(){
  var deffered = q.defer();
  var User = mongoose.model('User');
  var user = new User();
  user.username = 'ouval';
  user.email = 'ouval.research@gmail.com';
  user.fullname = 'Ouval Research';
  user.password = 'hagemaru';  
  user.type = 'brand';
  user.save(function(err, user){
    deffered.resolve({username:user.username, password:'hagemaru'});
  });
  return deffered.promise;
};
global.getUserToken = function(credential){
   var deffered = q.defer();
  request.post('/authenticate')
  .send(credential)
  .end(function(err, res){
    if(err)
      throw err;
    var token = res.body.token;
    deffered.resolve(token);
  });
  return deffered.promise;
};
global.authenticate = function(brand){
  var deffered = q.defer();
  var customer = {
    initialize: function() {
      return (brand) ? initializeBrand() : initializeUser();
    }
  }  

  customer.initialize()
  .then(function(credential){
    getUserToken(credential)
    .then(function(token){
      deffered.resolve(token);
    });
  });
  return deffered.promise;
};
