describe('Report API', function () {
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe ('PUT /report/posts/:id', function () {
    it ('should return 404 and json message with success equla to false as a return if post is no longer exist', function (done) {
      authenticate()
      .then(function (token) {
        request.put('/report/posts/' + new mongoose.Types.ObjectId())
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res){
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.success.should.equal(false);
          done();
        });
      });
    });
    it('should return 200 and json object with success equal to true as it\'s property when report a post is success', function (done) {
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
              request.put('/report/posts/' +  post._id)
              .set('Authorization', 'Bearer ' + token)
              .expect(200)
              .end(function(err, res) {
                res.body.should.have.property('success');
                res.body.success.should.equal(true);
                done();
              });
            });
          });
        });
      });
    });
  });
});
