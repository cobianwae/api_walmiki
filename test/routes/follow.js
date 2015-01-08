describe('Follow API', function () {
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe('PUT /follow/users/:id', function () {
    //callback will accept user as parameter
    var createDummyUsers = function(callback){
      var User = mongoose.model('User');
      var newUser = new User();
      newUser.username = 'fdikdik';
      newUser.password = 'hagemaru';
      newUser.fullname = 'Dikdik Fazzarudin';
      newUser.email = 'fdikdik@gmail.com';
      newUser.save(function(err, user){
        callback(user);
      });
    };
    it('should return 404 and json message if users is no longer exist', function (done) {
      authenticate()
      .then(function (token) {
        request.put('/follow/users/' + new mongoose.Types.ObjectId())
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          done();
        });
      });
    });
    it('should return json message with success equal to true as it\'s property if the process is success', function(done){
      createDummyUsers(function(user){
        authenticate()
        .then(function (token) {
          request.put('/follow/users/' + user._id)
          .set('Authorization', 'Bearer ' + token)
          .expect(200)
          .end(function(err, res) {
            res.body.success.should.equal(true);
            done();
          });
        });
      });
    });
    it('should return 201 if tried to follow the user who has been followed', function(done){
      createDummyUsers(function(user){
        authenticate()
        .then(function (token) {
          request.put('/follow/users/' + user._id)
          .set('Authorization', 'Bearer ' + token)
          .end(function(err, res) {
            request.put('/follow/users/' + user._id)
            .set('Authorization', 'Bearer ' + token)
            .expect(201)
            .end(function(err, res) {
              res.body.success.should.equal(false);
              done();
            });
          });
        });
      });
    });
  });
});
