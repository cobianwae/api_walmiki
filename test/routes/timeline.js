describe('Timeline API', function(){
  beforeEach(function(done){
    clearDB();
    done();
  });
  describe('Get /timeline', function(){
    it('should return an empty array if there is no timeline yet', function(done){
      authenticate()
      .then(function(token){
        request.get('/timeline')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res){
          res.body.should.be.type('object');
          res.body.length.should.equal(0);
          done();
        });
      });
    });
    it('should return most recent user\'s posts and most recent posts from users who are followed', function(done){
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
                posts.push({title : '1 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '2 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '3 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '4 Post', image:res.body.success[0].id, author:newUser._id});
                posts.push({title : '5 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '6 Post', image:res.body.success[0].id, author:newUser._id});
                posts.push({title : '7 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '8 Post', image:res.body.success[0].id, author:newUser._id});
                posts.push({title : '9 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '10 Post', image:res.body.success[0].id, author:user._id});
                Post.collection.insert(posts, function(err, posts){
                  var post = new Post();
                  post.title = '11 Post';
                  post.image = res.body.success[0].id;
                  post.author = newUser._id;
                  post.save(function(err, post){
                    request.get('/timeline')
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(function(err, res){
                      for (var i in res.body){
                        console.log(res.body[i].title + ' ' + new Date(res.body[i].createdOn) );
                      }
                      res.body.should.be.type('object');
                      res.body.length.should.equal(10);
                      res.body[0].title.should.equal('11 Post');
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
    it('should return user\'s posts and posts from users who are followed before the given date', function(done){
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
                var post = new Post();
                post.title = '1 Post';
                post.image = res.body.success[0].id;
                post.author = newUser._id;
                post.save(function(err, post){
                  posts.push({title : '2 Post', image:res.body.success[0].id, author:user._id});
                  posts.push({title : '3 Post', image:res.body.success[0].id, author:user._id});
                  posts.push({title : '4 Post', image:res.body.success[0].id, author:newUser._id});
                  posts.push({title : '5 Post', image:res.body.success[0].id, author:user._id});
                  posts.push({title : '6 Post', image:res.body.success[0].id, author:newUser._id});
                  posts.push({title : '7 Post', image:res.body.success[0].id, author:user._id});
                  posts.push({title : '8 Post', image:res.body.success[0].id, author:newUser._id});
                  posts.push({title : '9 Post', image:res.body.success[0].id, author:user._id});
                  posts.push({title : '10 Post', image:res.body.success[0].id, author:user._id});
                  posts.push({title : '11 Post', image:res.body.success[0].id, author:user._id});
                  Post.collection.insert(posts, function(err, posts){
                    request.get('/timeline')
                    .set('Authorization', 'Bearer ' + token)
                    .end(function(err, res){
                       for (var i in res.body){
                        console.log(res.body[i].title + ' ' + new Date(res.body[i].createdOn) );
                      }
                      request.get('/timeline?before='+ res.body[9].createdOn )
                      .set('Authorization', 'Bearer ' + token)
                      .end(function(err, res){
                        res.body[0].title.should.equal('1 Post');
                        res.body.length.should.equal(1);
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
    it('should return user\'s posts and posts from users who are followed after the given time', function(done){
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
                posts.push({title : '1 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '2 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '3 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '4 Post', image:res.body.success[0].id, author:newUser._id});
                posts.push({title : '5 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '6 Post', image:res.body.success[0].id, author:newUser._id});
                posts.push({title : '7 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '8 Post', image:res.body.success[0].id, author:newUser._id});
                posts.push({title : '9 Post', image:res.body.success[0].id, author:user._id});
                posts.push({title : '10 Post', image:res.body.success[0].id, author:user._id});
                var imageId = res.body.success[0].id;
                Post.collection.insert(posts, function(err, posts){
                  request.get('/timeline')
                  .set('Authorization', 'Bearer ' + token)
                  .end(function(err, res){
                    for (var i in res.body){
                        console.log(res.body[i].title + ' ' + new Date(res.body[i].createdOn) );
                      }
                    var post = new Post();
                    post.title = '11 Post';
                    post.image = imageId;
                    post.author = newUser._id;
                    post.save(function(err, post){
                      console.log(post.title + ' ' + post.createdOn );
                      request.get('/timeline?after=' + res.body[0].createdOn)
                      .set('Authorization', 'Bearer ' + token)
                      .end(function(err, res){
                        res.body.length.should.equal(1);
                        res.body[0].title.should.equal('11 Post');
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
  });
});
