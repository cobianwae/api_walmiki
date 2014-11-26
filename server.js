var express    = require('express');
var app        = express();
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var db 	= require('./model/db');
var user = require('./routes/user');
var post = require('./routes/post');
var image = require('./routes/image');
var tag = require('./routes/tag');
var cors = require('cors');

app.use('/api', expressJwt({secret : 'lookats-05112014162539'}).unless({path:['/api/authenticate', '/api/register', /\/api\/image\/\w*/ig]}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// var port = process.env.PORT || 9090;
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 9090;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var router = express.Router();

router.route('/authenticate').post(user.authenticate);
router.route('/register').post(user.doCreate);

router.route('/user').put(user.doUpdate);
router.route('/user').get(user.getById);
router.route('/users/:fullname').get(user.getUsers);
router.route('/user/interests').put(user.doUpdateInterests);
router.route('/user/follow').put(user.doFollow);
router.route('/user/unfollow').put(user.doUnfollow);
router.route('/user/timeline').get(user.getTimeline);

router.route('/post').post(post.doCreate);
router.route('/post/mostliked').get(post.getMostLikedPosts);
router.route('/post/like').put(post.doLike);
router.route('/post/repost').post(post.doRepost);
router.route('/image').post(post.doUploadImage);
router.route('/image/:id').get(image.getImageById);

router.route('/tags/:name').get(tag.getTags);

// router.route('/user/recommenduser').get(user.getReccommendUser);
// router.route('/user/follow').put(user.doFollow);
// router.route('/user/unfollow').put(user.doUnfollow);

app.use('/api', router);

app.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port)
});
