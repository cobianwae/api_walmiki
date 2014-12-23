describe('Post API', function(){
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe('Post /posts', function(){
    it('should return validation message if the request is not valid', function(done){
      authenticate()
      .then(function(token){
        request.post('/posts')
        .set('Authorization', 'Bearer ' + token)
        .expect(403, done);
      });
    });
    it('should return validation message if the title field is empty', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id})
          .expect(403)
          .end(function(err, res){
            res.body.should.have.property('field');
            res.body.field.should.equal('title');
            done();
          });
        });
      });
    });
    it('should return validation message if the image field is empty', function(done){
      authenticate()
      .then(function(token){
        request.post('/posts')
        .set('Authorization', 'Bearer ' + token)
        .send({title: 'My First post'})
        .expect(403)
        .end(function(err, res){
          res.body.should.have.property('field');
          res.body.field.should.equal('image');
          done();
        });
      });
    });
    it('should return success true if the post successfully created', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My First Post'})
          .expect(200)
          .end(function(err, res){
            res.body.should.have.property('success');
            res.body.success.should.equal(true);
            done();
          });
        });
      });
    });
    it('should created new brand if trying to create new post with tagged brand that does not exist before', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My First Post', brands:[{brand:'brodo', coordinate:[7,7]}] })
          .expect(200)
          .end(function(err, res){
            res.body.should.have.property('success');
            res.body.success.should.equal(true);
            var brand = mongoose.model('Brand');
            brand.findOne({name:'brodo'}, function(err, brand){
              brand.should.have.property('name');
              brand.name.should.equal('brodo');
              var post = mongoose.model('Post');
              post.findOne({title: 'My First Post'}, function(err, post){
                post.should.have.property('title');
                post.title.should.equal('My First Post');
                post.brands.length.should.equal(1);
                post.brands[0].brand.id.should.equal(brand._id.id);
                done();
              });
            });
          });
        });
      });
    });
    it('should created new tag if trying to create new post with tags that does not exist before', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My First Post', tags:['syalala', 'awesome'] })
          .expect(200)
          .end(function(err, res){
            res.body.should.have.property('success');
            res.body.success.should.equal(true);
            var Tag = mongoose.model('Tag');
            Tag.find({}, function(err, tags){
              tags.length.should.equal(2);
              var post = mongoose.model('Post');
              post.findOne({title: 'My First Post'}, function(err, post){
                post.should.have.property('title');
                post.title.should.equal('My First Post');
                post.tags.length.should.equal(2);
                done();
              });
            });
          });
        });
      });
    });
    it('should created new tag and brands if trying to create new post with tags and brands that does not exist before', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My First Post', brands:[{brand:'brodo', coordinate:[7,7]}], tags:['syalala', 'awesome'] })
          .expect(200)
          .end(function(err, res){
            res.body.should.have.property('success');
            res.body.success.should.equal(true);
            var Tag = mongoose.model('Tag');
            Tag.find({}, function(err, tags){
              tags.length.should.equal(2);
              var post = mongoose.model('Post');
              post.findOne({title: 'My First Post'}, function(err, post){
                post.should.have.property('title');
                post.title.should.equal('My First Post');
                post.tags.length.should.equal(2);
                post.brands.length.should.equal(1);
                var brand = mongoose.model('Brand');
                brand.findOne({name:'brodo'}, function(err, brand){
                  brand.should.have.property('name');
                  brand.name.should.equal('brodo');
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
  describe('GET /posts/:id', function(){
    it('should return 404 not found error if trying to get non exist post', function(done){
      authenticate()
      .then(function(token){
        request.get('/posts/' + mongoose.Types.ObjectId())
        .set('Authorization', 'Bearer ' + token)
        .expect(404, done);
      });
    });
    it('should return post json if trying to get an exist post', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My First Post'})
          .end(function(err, res){
            var Post = mongoose.model('Post');
            Post.findOne({title : 'My First Post'}, function(err, post){
              if(err)
                throw err;
              request.get('/posts/' + post._id)
              .set('Authorization', 'Bearer ' + token)
              .end(function(err, res){
                res.body.should.have.property('_id');
                res.body._id.toString().should.equal(post._id.toString());
                done();
              });
            });
          });
        });
      });
    });
  });
});
