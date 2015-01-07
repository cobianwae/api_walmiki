var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

exports.getByPostId = function(req, res) {	
	if(isEmptyObject(req.body))
    return res.status(403).send('Bad Request');
	Post.findById(req.params.postId)
	.populate('comment.author')	
	.exec(function(err, posts) {
		if (err) {
			res.send(err);
		}

		res.send(posts.comment);

	});
}

exports.doCreate = function(req, res) {
	console.log(req.body);
	if(isEmptyObject(req.body))
    return res.status(403).send('Bad Request');

	Post.findById(req.body.thePostId)
		.exec(function(err, post) {
			if (err) {
				res.send(err);
			}

			var comment = new Comment();
			comment.text = req.body.text;
			comment.author = req.user.id;
			comment.postId = req.body.thePostId;
			post.comment.push(comment);

			post.save(function(saveErr, updatedPost) {
				Post.findOne(updatedPost).populate('comment.author').exec(function(err, updatedPost){
					res.send({success: true, message: 'sucess add comment', comment: updatedPost.comment.id(comment._id)});
				})
			});
		});
}

		
