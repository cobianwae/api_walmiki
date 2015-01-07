describe('Repost API', function () {
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe('PUT /repost/:id', function () {
    it('should return 404 and json message if post is no longer exist', function (done) {
      authenticate()
      .then(function (token) {
        request.put('/repost/' + new mongoose.Types.ObjectId())
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          done();
        });
      });
    });
    it('should return 200 and json object with success and repostedNumber as it\'s properties when repost a post is success', function (done) {
      authenticate()
      .then(function (token) {
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My First Post'})
          .end(function(err, res){
            var Post = mongoose.model('Post');
            Post.findOne({title : 'My First Post'}, function(err, post) {
              request.put('/repost/' +  post._id)
              .set('Authorization', 'Bearer ' + token)
              .expect(200)
              .end(function(err, res) {
                res.body.success.should.equal(true);
                res.body.should.have.property('repostedNumber');
                res.body.repostedNumber.should.equal(1);
                Post.findOne({originalPost : post._id}, function(err, repost){
                  repost.title.should.equal(post.title);
                  done();
                });
              });
            });
          });
        });
      });
    });
    it('should return 201 if a same user tried to repost a post more than once', function (done) {
      authenticate()
      .then(function (token) {
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My First Post'})
          .end(function(err, res){
            var Post = mongoose.model('Post');
            Post.findOne({title : 'My First Post'}, function(err, post) {
              request.put('/repost/' +  post._id)
              .set('Authorization', 'Bearer ' + token)
              .end(function(err, res) {
                request.put('/repost/' +  post._id)
                .set('Authorization', 'Bearer ' + token)
                .expect(201)
                .end(function(err, res) {
                  res.body.success.should.equal(false);
                  res.body.should.have.property('message');
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
  describe('GET /repost/:id', function () {
    var beforeGetReposted = function(callback,done){
      authenticate()
      .then(function (token) {
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My First Post'})
          .end(function(err, res){
            //batch insert users
            var newUsers = [];
            for(var i = 0; i < 10; i++){
              newUsers.push({
                username : 'fdikdik_' + i,
                email : 'fdikdik_' + i + '@gmail.com',
                password : 'password_' + i,
                fullname : 'dikdik fazzarudin_' + i
              });
            }
            var User = mongoose.model('User');
            User.collection.insert(newUsers, function(err, users) {
              //get post to be reposted
              var Post = mongoose.model('Post');
              Post.findOne({title:'My First Post'}, function (err, post) {
                //batch posts (reposted post)s
                var newPosts = [];
                for(var i in users){
                  newPosts.push({
                    title : post.title,
                    image : post.image,
                    author : users[i]._id,
                    originalPost : post._id
                  });
                  post.reposted.push(users[i]._id);
                  post.repostedNumber +=1;
                }
                post.save(function(err,post) {
                  Post.collection.insert(newPosts, function(err, posts) {
                    callback(token, post, posts);
                  });
                });
              });
            });
          });
        });
      });
    };

    it('should return 404 and json message if post is no longer exist', function (done) {
      authenticate()
      .then(function (token) {
        request.get('/repost/' + new mongoose.Types.ObjectId())
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          done();
        });
      });
    });
    it('should return list of users who were reposted the choosen post', function(done) {
      beforeGetReposted(function(token, post, posts){
        request.get('/repost/' +  post._id)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          res.body.length.should.equal(10);
          done();
        });
      }, done);
    });
    it('should return list of users who were reposted the choosen post after given time', function(done) {
      beforeGetReposted(function(token, post, posts){
        request.get('/repost/' +  post._id)
        .set('Authorization', 'Bearer ' + token)
        .end(function(err, res) {
          var User  =  mongoose.model('User');
          var newUser = new User();
          newUser.username = 'newuser';
          newUser.fullname = 'New User';
          newUser.password = 'hagemaru6414';
          newUser.email = 'newuser@gmail.com';
          newUser.save(function(err, user){
            //repost
            var Post  = mongoose.model('Post');
            var newPost = new Post();
            newPost.title = post.title;
            newPost.image = post.image;
            newPost.author = user._id;
            newPost.originalPost = post._id;
            newPost.createdOn = '9999-01-07T16:18:37.324Z';

            post.reposted.push(user._id);
            post.repostedNumber += 1;
            post.save(function(err, post){
              newPost.save(function(err, newPost){
                request.get('/repost/' +  post._id + '?after=' + res.body[0].repostedOn)
                .set('Authorization', 'Bearer ' + token)
                .end(function(err, res) {
                  res.body.length.should.equal(1);
                  res.body[0].username.should.equal('newuser');
                  done();
                });
              });
            });
          });

        });

      }, done);
    });
    it('should return list of users who were reposted the choosen post before given time', function(done) {
      beforeGetReposted(function(token, post, posts){
        var User  =  mongoose.model('User');
        var newUser = new User();
        newUser.username = 'newuser';
        newUser.fullname = 'New User';
        newUser.password = 'hagemaru6414';
        newUser.email = 'newuser@gmail.com';
        newUser.save(function(err, user){
          //repost
          var Post  = mongoose.model('Post');
          var newPost = new Post();
          newPost.title = post.title;
          newPost.image = post.image;
          newPost.author = user._id;
          newPost.originalPost = post._id;
          newPost.createdOn = '0000-01-07T16:18:37.324Z';

          post.reposted.unshift(user._id);
          post.repostedNumber += 1;
          post.save(function(err, post){
            newPost.save(function(err, newPost){
              request.get('/repost/' +  post._id)
              .set('Authorization', 'Bearer ' + token)
              .end(function(err, res) {
                request.get('/repost/' +  post._id + '?before=' + res.body[9].repostedOn)
                .set('Authorization', 'Bearer ' + token)
                .end(function(err, res) {
                  res.body.length.should.equal(1);
                  res.body[0].username.should.equal('newuser');
                  done();
                });
              });
            });
          });
        });
      }, done);
    });
  });
});
