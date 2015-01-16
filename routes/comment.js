var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

exports.getByPostId = function(req, res) {			
	Post.findById(req.params.postId)
	.populate('comment.author')	
	.exec(function(err, post) {
		if (err) {
			res.send(err);
		}

		if (!post) {
			return res.status(404).send({success:false, message: 'the post is no longer exist'});
		}      
		
		res.status(200).send({success: true, comments : post.comment});
	});
}

exports.doCreate = function(req, res) {	
	if(req.body.thePostId === undefined) {
    return res.status(403).send('Bad Request');
  } else if (req.body.text === undefined ||  req.body.text === '') {
		res.send({success: false, message: 'you need to write your comment first'});
		return;
  }
  

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
			post.commentNumber = post.commentNumber + 1;
			post.save(function(saveErr, updatedPost) {
				Post.findOne(updatedPost).populate('comment.author').exec(function(err, updatedPost){
					res.send({success: true, message: 'sucess add comment', comment: updatedPost.comment.id(comment._id), commentNumber: updatedPost.commentNumber});
				})
			});
		});
}

		
