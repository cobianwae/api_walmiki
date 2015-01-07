describe('Comment API', function() {
	beforeEach(function(done) {
		clearDB();
		done();
	});

	describe('POST /comments', function(){
		it('should return error if user trying to comment to unexisted post', function(done) {
			initializeUser()
			.then(function(credential) {
				getUserToken(credential)
				.then(function(token){
					request.post('/comments')
					.set('Authorization', 'Bearer' + token)
					.expect(403, done)
				});
			});
		});
	});
})