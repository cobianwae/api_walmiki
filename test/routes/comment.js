describe('Comment API', function() {
	beforeEach(function(done) {
		clearDB();
		return done();
	});

	describe('Post /comments', function() {
		it('should return error if user trying to comment to unexisted post', function(done) {			
			authenticate().then(function(token){
        request.post('/comments')
        .set('Authorization', 'Bearer ' + token)
        .expect(403, done);
      });
		});

		it('should return false as success property if user trying to add empty comment', function(done) {			
			authenticate().then(function(token){
        request.post('/comments')
        .set('Authorization', 'Bearer ' + token)
        .send({thePostId: new mongoose.Types.ObjectId()})
        .end(function(err, res){
          res.body.success.should.equal(false);
          res.body.should.have.property('message');
          done();
        });
      });
		});

		it('should return 404 and json message if post is no longer exist', function(done) {			
			authenticate().then(function(token){
        request.get('/comments/' + new mongoose.Types.ObjectId())	        
	        .set('Authorization', 'Bearer ' + token)
	        .expect(404)
	        .end(function(err, res) {
	          res.body.success.should.equal(false);
	          res.body.should.have.property('message');
	          done();
        });      	
      });
		});

		it('should return 200 and success if comment successfully posted', function(done) {			
			authenticate().then(function(token) {				
				request.post('/images')
				.set('Authorization', 'Bearer ' + token)
				.attach('image', 'test/resources/sample-image.jpg')
				.end(function(err, res) {					
					request.post('/posts')
          .set('Authorization', 'Bearer ' + token)
          .send({image: res.body.success[0].id, title: 'My Post For Comment' })
          .expect(200)
          .end(function(err, res){
          	var post = mongoose.model('Post');
            post.findOne({title: 'My Post For Comment'}, function(err, post) {
            	request.post('/comments')
            	.set('Authorization', 'Bearer ' + token)
            	.send({text: 'my first comment', thePostId: post._id})
            	.expect(200)
            	.end(function(err, res) {
            		 res.body.success.should.equal(true);
            		 done();
            	});     	
          	});
          });
				});
      });
		});

	});
})