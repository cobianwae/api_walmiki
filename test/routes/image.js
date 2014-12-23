describe('Image API', function(){
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe('POST /images', function(){
    it ('should return error if trying to post an image with incorrect parameter', function(done){
      initializeUser()
      .then(function(credential){
        getUserToken(credential)
        .then(function(token){
          request.post('/images')
          .set('Authorization', 'Bearer ' + token)
          .expect(403, done);
        });
      });
    });
    it('should return image id if successfully add an image', function(done){
      initializeUser()
      .then(function(credential){
        getUserToken(credential)
        .then(function(token){
          request.post('/images')
          .set('Authorization', 'Bearer ' + token)
          .attach('image', 'test/resources/sample-image.jpg')
          .end(function(err, res){
            res.body.should.have.property('success');
            res.body.success.should.be.an.instanceOf(Array);
            res.body.success[0].should.have.property('id');
            done();
          });
        });
      });
    });
  });
  describe('GET images/:id', function(){
    it('should return error not found if the image is not exist', function(done){
      request.get('/images/' + new mongoose.Types.ObjectId())
      .expect(404, done);
    });
    it('should return 200 status code if request is success', function(done){
      initializeUser()
      .then(function(credential){
        getUserToken(credential)
        .then(function(token){
          request.post('/images')
          .set('Authorization', 'Bearer ' + token)
          .attach('image', 'test/resources/sample-image.jpg')
          .end(function(err, res){
            request.get('/images/' +  res.body.success[0].id)
            .expect(200)
            .end(function(err, res){
              res.header['content-type'].should.equal('image/jpeg');
              done();
            });
          });
        });
      });
    });
  });
});
