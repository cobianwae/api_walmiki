describe('Like API', function () {
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe('PUT /like/posts:id', function () {
    it('should return 404 and json message if post is no longer exist', function (done) {
      authenticate()
      .then(function (token) {
        request.put('/like/posts/' + new mongoose.Types.ObjectId())
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          done();
        });
      });
    });
    it('should return 200 and json object with success and likedNumber as it\'s properties when like a post is success', function (done) {
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
              request.put('/like/posts/' +  post._id)
              .set('Authorization', 'Bearer ' + token)
              .expect(200)
              .end(function(err, res) {
                res.body.success.should.equal(true);
                res.body.should.have.property('likedNumber');
                res.body.likedNumber.should.equal(1);
                done();
              });
            });
          });
        });
      });
    });
    it('should return 201 if a same user tried to like a post more than once', function (done) {
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
              request.put('/like/posts/' +  post._id)
              .set('Authorization', 'Bearer ' + token)
              .end(function(err, res) {
                request.put('/like/posts/' +  post._id)
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

  describe('GET /like/posts/:id', function () {
    var beforeGetLikes = function(callback,done){
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

              //get post to be liked
              var Post = mongoose.model('Post');
              Post.findOne({title:'My First Post'}, function (err, post) {                                

                for(var i in users) {                  
                  post.liked.push(users[i]._id);
                  post.likedNumber +=1;
                }
                post.save(function(err,updatedPost) {
                  callback(token, updatedPost);                  
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
        request.get('/like/posts/' + new mongoose.Types.ObjectId())
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          done();
        });
      });
    });

    it('should return list of users who liked the chosen post', function(done) {
      beforeGetLikes(function(token, post){
        request.get('/like/posts/' +  post._id)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          res.body.length.should.equal(10);
          res.body[9].username.should.equal('fdikdik_9');
          done();
        });
      }, done);
    });
  });
});
