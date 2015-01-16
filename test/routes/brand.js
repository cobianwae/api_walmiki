describe('Brand API', function(){
  beforeEach(function(done){
    clearDB();
    return done();
  });
  describe('GET /brands', function(){
    beforeEach(function(done){
      var brand1 = {
        username : 'brandsatu',
        email : 'brand.satu@gmail.com',
        fullname : 'Brand Satu',
        password : 'hagemaru6414',
        type : 'brand'
      };
      var brand2 = {
        username : 'branddua',
        email : 'brand.dua@gmail.com',
        fullname : 'Brand Dua',
        password : 'hagemaru6414',
        type : 'brand'
      }
      var brands = [];
      brands.push(brand1);
      brands.push(brand2);
      var Brand = mongoose.model('User');
      Brand.create(brands, function(err, brands){
        done();
      });
    });
    it ('should return the list of brands excluding her/himself', function(done){
      authenticate()
      .then(function(token){
        request.get('/brands?term=brand')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res){
          res.body.length.should.equal(2);
          done();
        });
      });
    });
  });
});
