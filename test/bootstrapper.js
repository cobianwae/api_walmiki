global.should = require('should');
global.assert = require('assert');
global.q = require('q');
global.db = require('../model/db');
global.mongoose = require('mongoose');
global.request = require('supertest')('http://localhost:9090/api');
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
global.authenticate = function(){
  var deffered = q.defer();
  initializeUser()
  .then(function(credential){
    getUserToken(credential)
    .then(function(token){
      deffered.resolve(token);
    });
  });
  return deffered.promise;
};
