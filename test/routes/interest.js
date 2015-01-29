describe('Interest API', function(){
  beforeEach(function(done){
    clearDB();
    return done();
  });
  describe('Post /Interest', function() {
    it('should return 200 status and success is true if trying to update user interests', function(done) {
      var User = mongoose.model('User');
      var ChosenInterest = mongoose.model('ChosenInterest');
      var newUser = new User();
      newUser.username = 'fazar';
      newUser.email = 'mochamad.fazar@gmail.com';
      newUser.password = 'hagemaru';
      newUser.fullname = 'Mochamad Fazar';
      newUser.save(function(err, newUser){      
        getUserToken({username:'fazar', password:'hagemaru'})
        .then(function(token){
          request.put('/Interests')
          .set('Authorization', 'Bearer ' + token)
          .send({interests: ['suit', 'casual', 'beach', 'festival', 'party']})
          .expect(200)
          .end(function(err, res) {            
            ChosenInterest.findOne({interest: 'suit'}, function(err, interest) {
              res.body.success.should.equal(true);
              res.body.interests.length.should.equal(5);
              //interest.count.should.equal(1);  
              done();                            
            });            
          });
        });
      });
    });

    it('should return 200 status and amount of interests is 2 if other user add the existed interest', function(done) {
      this.timeout(10000);
      var User = mongoose.model('User');
      var ChosenInterest = mongoose.model('ChosenInterest');
      var firstUser = new User();
      firstUser.username = 'ffazar';
      firstUser.password = 'hagemaru';
      firstUser.fullname = 'Mochamad Fazar';
      firstUser.email = 'hallofazar@gmail.com';
      firstUser.save(function(err, firstUser){
        if(err)
          throw err;

        getUserToken({username:'ffazar', password:'hagemaru'})
          .then(function(token){
            request.put('/Interests')
            .set('Authorization', 'Bearer ' + token)
            .send({interests: ['traditional', 'batik', 'selendang']})
            .expect(200)
            .end(function(err, res) {
              res.body.interests.length.should.equal(3);
              
              getUserToken({username:'ffazar', password:'hagemaru'})
                .then(function(token){
                request.put('/Interests')
                .set('Authorization', 'Bearer ' + token)
                .send({interests: ['traditional', 'batik', 'selendang', 'suit']})
                .expect(200)
                .end(function(err, res) {
                  res.body.interests.length.should.equal(4);
                  
                  var newUser = new User();
                  newUser.username = 'fazar';
                  newUser.email = 'mochamad.fazar@gmail.com';
                  newUser.password = 'hagemaru';
                  newUser.fullname = 'Mochamad Fazar';
                  newUser.save(function(err, newUser){      
                    getUserToken({username:'fazar', password:'hagemaru'})
                    .then(function(token){
                      request.put('/Interests')
                      .set('Authorization', 'Bearer ' + token)
                      .send({interests: ['suit', 'casual', 'beach', 'festival', 'party', 'batik']})
                      .expect(200)
                      .end(function(err, res) {                        
                        res.body.success.should.equal(true);
                        res.body.interests.length.should.equal(6);                        
                        setTimeout(function(){
                          ChosenInterest.findOne({interest: 'batik'}, function(err, item){
                            if(err)
                              throw err;
                            item.count.should.equal(2);
                            done();
                          })
                        }, 1500);
                      });
                    });
                  });

                });
              });
            })
          });   
      });
    });


  }); // end describe 



  describe('GET interests', function(){
    it('should return 200 status and interests order by its count', function(done) {
      //this.timeout(10000);
      var chosenInterest = []
      chosenInterest.push({interest: 'traditional', count: 10});
      chosenInterest.push({interest: 'batik', count: 100});
      chosenInterest.push({interest: 'suit', count: 90});
      chosenInterest.push({interest: 'beach', count: 80});
      chosenInterest.push({interest: 'party', count: 70});
      chosenInterest.push({interest: 'travel', count: 60});
      chosenInterest.push({interest: 'local', count: 50});
      chosenInterest.push({interest: 'shoes', count: 40});
      chosenInterest.push({interest: 'watch', count: 30});
      chosenInterest.push({interest: 'ootd', count: 20});
      chosenInterest.push({interest: 'style', count: 10});
      chosenInterest.push({interest: 'gaya', count: 0});
      chosenInterest.push({interest: 'football', count: 0});

      var ChosenInterest = mongoose.model('ChosenInterest');
      ChosenInterest.collection.insert(chosenInterest, function(err, interests) {
        authenticate()
          .then(function(token){
            request.get('/Interests')
            .set('Authorization', 'Bearer ' + token)
            .end(function(err, res){
              res.body.success.should.equal(true);
              res.body.interests.length.should.equal(10);
              res.body.interests[0].interest.should.equal('batik');
              res.body.interests[1].count.should.equal(90);
              done();
            })
          })
      })
    });
  }); // end Get Interests

});
