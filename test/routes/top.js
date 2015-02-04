describe('Top API', function () {
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe('GET /top/users', function () {
    it('it should retun top ten users sort by followers numbers', function(done){
      var User = mongoose.model('User');
      var newUser = new User();
      var otherUsers = [];
      newUser.username = 'cobianwae';
      newUser.email   = 'cobian.wae@gmail.com';
      newUser.password = 'hagemaru6414';
      newUser.fullname = 'Dikdik Fazzarudin';
      newUser.interests = ['sleeping','eating','watching movie'];
      newUser.followersNumber = 90;
      newUser.save(function(err, user){
        var otherUsers = [];
        for(var i =0; i < 10; i++){
          var anotherUser = {};
          anotherUser.username = 'user_' + i;
          anotherUser.email = 'user_' + i + '@lookats.com';
          anotherUser.password = 'hagemaru6414';
          anotherUser.fullname = 'User ' + i;
          anotherUser.followersNumber = i;
          otherUsers.push(anotherUser);
        }
        for(var i =10; i < 20; i++){
          var anotherUser = {};
          anotherUser.username = 'user_' + i;
          anotherUser.email = 'user_' + i + '@lookats.com';
          anotherUser.password = 'hagemaru6414';
          anotherUser.fullname = 'User ' + i;
          anotherUser.insterests =  ['sleeping','eating'];
          anotherUser.followersNumber = i;
          otherUsers.push(anotherUser);
        }
        User.collection.insert(otherUsers, function(err, users){
          getUserToken({username:'cobianwae', password:'hagemaru6414'})
          .then(function(token){
            request.get('/top/users')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .end(function(err, res){
              if(err)
                console.log(err);
              res.body.length.should.equal(10);
              res.body[0].username.should.equal('user_19');
              done();
            });
          });
        });
      });
    });
  });
});
