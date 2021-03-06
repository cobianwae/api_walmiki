describe('Wish API', function () {
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe('PUT /wish/posts:id', function () {
    it('should return 404 and json message if post is no longer exist', function (done) {
      authenticate()
      .then(function (token) {
        request.put('/wish/posts/' + new mongoose.Types.ObjectId())
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          done();
        });
      });
    });
    it('should return 200 and json object with success and wishedNumber as it\'s properties when wish a post is success', function (done) {
      authenticate(true)
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
              authenticate()
              .then(function(token){
                request.put('/wish/posts/' +  post._id)
                .set('Authorization', 'Bearer ' + token)
                .expect(200)
                .end(function(err, res) {                  
                  res.body.success.should.equal(true);
                  res.body.should.have.property('wishedNumber');
                  res.body.wishedNumber.should.equal(1);
                  done();
                });
              });              
            });
          });
        });
      });
    });

    it('should return 201 when the wished post came from member not brand' , function (done) {
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
              request.put('/wish/posts/' +  post._id)
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

    it('should return 201 if a same user tried to wish a post more than once', function (done) {
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
              request.put('/wish/posts/' +  post._id)
              .set('Authorization', 'Bearer ' + token)
              .end(function(err, res) {
                request.put('/wish/posts/' +  post._id)
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
