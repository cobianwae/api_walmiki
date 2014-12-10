global.should = require('should');
global.assert = require('assert');
global.db = require('../model/db');
global.mongoose = require('mongoose');
global.request = require('supertest')('http://localhost:9090/api');
global.clearDB = function(){
  for(var i in mongoose.connection.collections){
    mongoose.connection.collections[i].remove(function(){});
  }
};
