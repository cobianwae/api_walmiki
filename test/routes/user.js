describe('User API', function(){
  beforeEach(function(done){
    clearDB();
    return done();
  });
  describe('Post /Users', function(){
     var body = {
        username : 'cobianwae',
        email : 'cobian.wae@gmail.com',
        password : 'hagemaru6414',
        fullname : 'Dikdik Fazzarudin'
      };
    it ('should return json with success as its property', function(done){
      request.post('/users')
      .send(body)
      .expect(200)
      .end(function(err, res){
        if(err)
          throw err;
        res.body.should.have.property('success');
        res.body.success.should.equal(true);
        done();
      });
    });
    it ('should return error if trying to add existing username', function(done){
      request.post('/users')
      .send(body)
      .end(function(err, res){
        if(err)
          throw err;
        body.email = "yasallam@gmail.com";
        request.post('/users')
        .send(body)
        .expect(409)
        .end(function(err, res){
          if(err)
            throw err;
          res.body.should.have.property('message');
          res.body.success.should.equal(false);
          res.body.field.should.equal('username');
          done();
        });
      });
    });
    it ('should return error if trying to add existing email', function(done){
      request.post('/users')
      .send(body)
      .end(function(err, res){
        if(err)
          throw err;
        body.username = 'mfazar';
        request.post('/users')
        .send(body)
        .expect(409)
        .end(function(err, res){
          if(err)
            throw err;
          res.body.should.have.property('message');
          res.body.success.should.equal(false);
          res.body.field.should.equal('email');
          done();
        });
      });
    });
  });
  describe('POST /authenticate', function(){
     var body = {
        username : 'cobianwae',
        email : 'cobian.wae@gmail.com',
        password : 'hagemaru6414',
        fullname : 'Dikdik Fazzarudin'
      };
    it ('should return error if trying to authenticate an unregistered user', function(done){
      request.post('/authenticate')
      .send({username:'cobianwae', password:'hagemaru6414'})
      .expect(400)
      .end(function(err, res){
        res.body.should.have.property('message');
        res.body.success.should.equal(false);
        res.body.field.should.equal('username');
        done();
      });
    });
    it('should return a validation message if the password did not match', function(done){
      request.post('/users')
      .send(body)
      .end(function(err, res){
        request.post('/authenticate')
        .send({username:'cobianwae', password:'yasallam'})
        .expect(400)
        .end(function(err, res){
          res.body.should.have.property('message');
          res.body.success.should.equal(false);
          res.body.field.should.equal('password');
          done();
        });
      });
    });
    it('should return a token if authentication process succeed', function(done){
      request.post('/users')
      .send(body)
      .end(function(err, res){
        request.post('/authenticate')
        .send({username:'cobianwae', password:'hagemaru6414'})
        .expect(200)
        .end(function(err, res){
          res.body.should.have.property('token');
          res.body.success.should.equal(true);
          done();
        });
      });
    });
  });
  describe('GET users/:id', function(){
    var token, userId;
    beforeEach(function(done){
       var body = {
        username : 'cobianwae',
        email : 'cobian.wae@gmail.com',
        password : 'hagemaru6414',
        fullname : 'Dikdik Fazzarudin'
      };
      request.post('/users')
      .send(body)
      .end(function(err, res){
        if(err)
          throw err;
        request.post('/authenticate')
        .send({username:'cobianwae', password:'hagemaru6414'})
        .end(function(err, res){
          if(err)
            throw err;
          token = res.body.token;
          var User = mongoose.model('User');
          User.find({username:'cobianwae'}, function(err, users){
            if(err)
              throw err;
            userId = users[0]._id;
            done();
          });
        });
      });
    });
    it('should return page not found if the user is not registered', function(done){
      var id = new mongoose.Types.ObjectId();
      request.get('/users/' + id)
      .set('Authorization', 'Bearer ' + token)
      .expect(404, done);
    });
    it('should return a user object if it is matched with existing user', function(done){
       request.get('/users/' + userId)
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
       .end(function(err, res){
         res.body.should.have.property('id');
         res.body.username.should.equal('cobianwae');
         done();
       });
    });
  });
  describe('GET /users', function(){
    beforeEach(function(done){
      var user1 = {
        username : 'cobianwae',
        email : 'cobian.wae@gmail.com',
        fullname : 'Cobian Wae',
        password : 'hagemaru6414'
      };
      var user2 = {
        username : 'cobiandev',
        email : 'cobian.dev@gmail.com',
        fullname : 'Cobian Dev',
        password : 'hagemaru6414'
      }
      var users = [];
      users.push(user1);
      users.push(user2);
      var User = mongoose.model('User');
      User.create(users, function(err, users){
        done();
      });
    });
    it ('should return the list of users excluding her/himself', function(done){
      getUserToken({username:'cobianwae', password:'hagemaru6414'})
      .then(function(token){
        request.get('/users')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res){
          res.body.length.should.equal(1);
          done();
        });
      });
    });
  });
});
