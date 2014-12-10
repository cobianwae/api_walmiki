var mongoose = require( 'mongoose' );
var Post = mongoose.model( 'Post' );
var Tag = mongoose.model( 'Tag' );
var Brand = mongoose.model( 'Brand' );

exports.doCreate = function(req, res){
	var post = new Post();
  var newBrands = [];
  var newBrandCoordinates = [];
  var newTags = [];
	post.author = req.user.id;
	post.title = req.body.title;
	post.image = req.body.image;
	for (var i in req.body.brands){
		if ( mongoose.Types.ObjectId.isValid(req.body.brands[i].brand) ){
			post.brands.push({
				brand : req.body.brands[i].brand,
				coordinate : req.body.brands[i].coordinate
			});
		}else{
			var brand = new Brand();
			brand.name = req.body.brands[i].brand;
		  newBrands.push(brand);
      newBrandCoordinates[req.body.brands[i].brand] = req.body.brands[i].coordinate;
		}
	}
	for(var i in req.body.tags){
      	if(mongoose.Types.ObjectId.isValid(req.body.tags[i])) {
      		post.tags.push(req.body.tags[i]);
      	}else{
      		var tag = new Tag();
      		tag.name = req.body.tags[i];
      		newTags.push(tag);
      	}
  }
 	for(var i in req.body.taggedUsers){
    	if(mongoose.Types.ObjectId.isValid(req.body.taggedUsers[i])){
      		post.taggedUsers.push(mongoose.Types.ObjectId(req.body.taggedUsers[i]));
      }
  }
  Tag.collection.insert(newTags, function(err, tags){
    if(err)
      return next(err);
    for(var i in tags){
      post.tags.push(tags[i]._id);
    }
    Brand.collection.insert(newBrands, function(err, brands){
      if(err)
        return next(err);
      for(var i in brands){
        post.brands.push({
          brand : brands[i]._id,
          coordinate : newBrandCoordinates[brands[i].name]
        });
      }
      post.save(function (err, post) {
        if (err)
          return next(err);
        res.send({success:true});
      });
    });
  });
};
