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
            var brand = mongoose.model('User');
            brand.findOne({fullname:'brodo'}, function(err, brand){
              brand.should.have.property('fullname');
              brand.fullname.should.equal('brodo');
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
                var brand = mongoose.model('User');
                brand.findOne({fullname:'brodo'}, function(err, brand){
                  brand.should.have.property('fullname');
                  brand.fullname.should.equal('brodo');
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
    it('should return 404 not found error if trying to get posts without query params or get non existed post', function(done){
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

  describe('GET /posts/', function(){
    it('should return posts by this user ordered by date', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          var User = mongoose.model('User');
          User.findOne({username : 'cobianwae'}, function(err, user){
            var Post = mongoose.model('Post');
            var posts = [];
            var newUser = new User();
            newUser.username = 'cobiandev';
            newUser.email = 'cobian.dev@gmail.com';
            newUser.password = 'hagemaru6414';
            newUser.fullname = 'Dikdik Fazzarudin';
            newUser.save(function(err, newUser){
              user.following.push(newUser._id);
              user.save(function(err, user){
                posts.push({title : '1 Post', image:res.body.success[0].id, author:user._id, createdOn: '0000-01-07T16:13:37.324Z'});
                posts.push({title : '2 Post', image:res.body.success[0].id, author:user._id, createdOn: '0000-01-07T16:14:37.324Z'});
                posts.push({title : '3 Post', image:res.body.success[0].id, author:user._id, createdOn: '0000-01-07T16:15:37.324Z'});
                posts.push({title : '4 Post', image:res.body.success[0].id, author:user._id, createdOn: '0000-01-07T16:16:37.324Z'});
                Post.collection.insert(posts, function(err, posts) {
                  request.get('/posts?userId=' + user._id)
                  .set('Authorization', 'Bearer ' + token)
                  .expect(200)
                  .end(function(err, res) {                    
                    res.body.posts.length.should.equal(4);
                    res.body.posts[0].title.should.equal('4 Post');
                    res.body.posts[3].title.should.equal('1 Post');
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    it('should return posts by order its liked number', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          var User = mongoose.model('User');
          User.findOne({username : 'cobianwae'}, function(err, user){
            var Post = mongoose.model('Post');
            var posts = [];
            var newUser = new User();
            newUser.username = 'cobiandev';
            newUser.email = 'cobian.dev@gmail.com';
            newUser.password = 'hagemaru6414';
            newUser.fullname = 'Dikdik Fazzarudin';
            newUser.save(function(err, newUser){
              user.following.push(newUser._id);
              user.save(function(err, user){
                posts.push({title : '1 Post', image:res.body.success[0].id, author:user._id, liked: [user._id], likedNumber: 1});
                posts.push({title : '2 Post', image:res.body.success[0].id, author:user._id, liked: [user._id], likedNumber: 1});
                posts.push({title : '3 Post', image:res.body.success[0].id, author:user._id, liked: [user._id, newUser._id], likedNumber: 2});
                posts.push({title : '4 Post', image:res.body.success[0].id, author:user._id});
                Post.collection.insert(posts, function(err, posts) {
                  request.get('/posts?likedNumber=desc&userId=' + user._id)
                  .set('Authorization', 'Bearer ' + token)
                  .expect(200)
                  .end(function(err, res) {                    
                    res.body.posts.length.should.equal(3);
                    res.body.posts[0].likedNumber.should.equal(2);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    it('should return posts contains users wish list and order by date', function(done){
      authenticate(true)
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          var User = mongoose.model('User');
          User.findOne({username : 'ouval'}, function(err, user){
            var Post = mongoose.model('Post');
            var posts = [];
            var newUser = new User();
            newUser.username = 'cobiandev';
            newUser.email = 'cobian.dev@gmail.com';
            newUser.password = 'hagemaru6414';
            newUser.fullname = 'Dikdik Fazzarudin';
            newUser.save(function(err, newUser){
              user.following.push(newUser._id);
              user.save(function(err, user){
                posts.push({title : '1 Post', image:res.body.success[0].id, author:user._id, wished: [newUser._id], wishedNumber: 2, createdOn: '0000-01-07T16:11:37.324Z'});
                posts.push({title : '2 Post', image:res.body.success[0].id, author:user._id, wished: [newUser._id], wishedNumber: 3, createdOn: '0000-01-07T16:12:37.324Z'});
                posts.push({title : '3 Post', image:res.body.success[0].id, author:user._id, wished: [newUser._id], wishedNumber: 1, createdOn: '0000-01-07T16:13:37.324Z'});
                posts.push({title : '4 Post', image:res.body.success[0].id, author:user._id});
                Post.collection.insert(posts, function(err, posts) {
                  request.get('/posts?wishedNumber=desc&wishedBy=' + newUser._id)
                  .set('Authorization', 'Bearer ' + token)
                  .expect(200)
                  .end(function(err, res) {
                    res.body.posts.length.should.equal(3);
                    res.body.posts[0].wishedNumber.should.equal(1);
                    res.body.posts[1].wishedNumber.should.equal(3);
                    res.body.posts[2].wishedNumber.should.equal(2);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });

    it('should return posts where user has been tagged and ordered by date', function(done){
      authenticate()
      .then(function(token){
        request.post('/images')
        .set('Authorization', 'Bearer ' + token)
        .attach('image', 'test/resources/sample-image.jpg')
        .end(function(err, res){
          var User = mongoose.model('User');
          User.findOne({username : 'cobianwae'}, function(err, user){
            var Post = mongoose.model('Post');
            var posts = [];
            var newUser = new User();
            newUser.username = 'cobiandev';
            newUser.email = 'cobian.dev@gmail.com';
            newUser.password = 'hagemaru6414';
            newUser.fullname = 'Dikdik Fazzarudin';
            newUser.save(function(err, newUser){
              user.following.push(newUser._id);
              user.save(function(err, user){
                posts.push({title : '1 Post', image:res.body.success[0].id, author:user._id, taggedUsers: [newUser._id], createdOn: '0000-01-07T16:11:37.324Z'});
                posts.push({title : '2 Post', image:res.body.success[0].id, author:user._id, taggedUsers: [user._id, newUser._id], createdOn: '0000-01-07T16:12:37.324Z'});
                posts.push({title : '3 Post', image:res.body.success[0].id, author:user._id, taggedUsers: [newUser._id], createdOn: '0000-01-07T16:13:37.324Z'});
                posts.push({title : '4 Post', image:res.body.success[0].id, author:user._id});
                Post.collection.insert(posts, function(err, posts) {
                  request.get('/posts?taggedUser=' + newUser._id)
                  .set('Authorization', 'Bearer ' + token)
                  .expect(200)
                  .end(function(err, res) {
                    res.body.posts.length.should.equal(3);
                    res.body.posts[0].taggedUsers.length.should.equal(1);
                    res.body.posts[1].taggedUsers.length.should.equal(2);
                    res.body.posts[2].taggedUsers.length.should.equal(1);
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
