describe('Recommended API', function(){
  beforeEach(function(done){
    clearDB();
    return done();
  });
  describe('GET /Recommended/Users', function(){
    it('should return list of users according to similarity between insterests and tags in other users posts', function(done){
      var User = mongoose.model('User');
      var newUser = new User();
      newUser.username = 'cobianwae';
      newUser.email   = 'cobian.wae@gmail.com';
      newUser.password = 'hagemaru6414';
      newUser.fullname = 'Dikdik Fazzarudin';
      newUser.interests = ['sleeping','eating','watching movie'];
      newUser.save(function(err, user){
        var otherUsers = [];
        for(var i =0; i < 10; i++){
          var anotherUser = {};
          anotherUser.username = 'user_' + i;
          anotherUser.email = 'user_' + i + '@lookats.com';
          anotherUser.password = 'hagemaru6414';
          anotherUser.fullname = 'User ' + i;
          otherUsers.push(anotherUser);
        }
        for(var i =10; i < 20; i++){
          var anotherUser = {};
          anotherUser.username = 'user_' + i;
          anotherUser.email = 'user_' + i + '@lookats.com';
          anotherUser.password = 'hagemaru6414';
          anotherUser.fullname = 'User ' + i;
          anotherUser.insterests =  ['sleeping','eating'];
          otherUsers.push(anotherUser);
        }
        User.collection.insert(otherUsers, function(err, users){
          getUserToken({username:'cobianwae', password:'hagemaru6414'})
          .then(function(token){
            request.post('/images')
            .set('Authorization', 'Bearer ' + token)
            .attach('image', 'test/resources/sample-image.jpg')
            .end(function(err, res){
              //tags
              var Tag = mongoose.model('Tag');
              var newTags = [{
                name : 'sleeping'
              },{
                name : 'eating'
              }]

              Tag.collection.insert(newTags, function(err, tags){
                var newPosts = [];
                var Post = mongoose.model('Post');
                var tagIds = [];
                for(var i in tags){
                  tagIds.push(tags[i]._id);
                }
                for(var i= 0; i<5; i++){
                  var newPost = {type:'post'};
                  newPost.title = 'New Title';
                  newPost.image = res.body.success[0]._id;
                  newPost.author = users[i]._id;
                  newPost.tags = tagIds;
                  newPosts.push(newPost);
                }
                Post.collection.insert(newPosts, function(err, posts){
                  request.get('/recommended/users')
                  .set('Authorization', 'Bearer ' + token)
                  .expect(200)
                  .end(function(err, res){
                    res.body.length.should.equal(5);
                    done();
                  });
                });
              });
            });
          });
        });
      });

    });
  });
});
