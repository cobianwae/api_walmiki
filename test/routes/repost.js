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
});
