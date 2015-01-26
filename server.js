var express = require('express');
var app = express();
var db 	= require('./model/db');
var bodyParser = require('body-parser');
var user = require('./routes/user');
var brand = require('./routes/brand');
var post = require('./routes/post');
var image = require('./routes/image');
var interest = require('./routes/interest');
var comment = require('./routes/comment');
var timeline = require('./routes/timeline');
var cors = require('cors');
var expressJwt = require('express-jwt');
var allows = require('./utils/express-allows/index.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', allows(expressJwt({secret : 'lookats-05112014162539'}),[
  {path : '/authenticate', method:'post'},
  {path : '/users', method:'post'},
  {path : /\/images\/\w+/gi, method:'get'},
]));

  var serverPort = process.env.OPENSHIFT_NODEJS_PORT || 9090;
  serverPort = typeof process.env.NODE_ENV !== 'undefined' ? 7070 : serverPort;
  var serverIPAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

  var router = express.Router();
  router.route('/authenticate').post(user.authenticate);
  router.route('/users').post(user.doCreate);
  router.route('/users').put(user.doUpdate);
  router.route('/users/:id').get(user.getById);
  router.route('/users').get(user.getUsers);
  router.route('/changePassword').post(user.changePassword);

  router.route('/follow/users/:id').put(user.doFollow);
  router.route('/unfollow/users/:id').put(user.doUnfollow);

  router.route('/brands').get(brand.getBrands);

  router.route('/posts').post(post.doCreate);
  router.route('/posts/:id').get(post.getById);
  router.route('/posts').get(post.getPosts);

  router.route('/repost/:id').put(post.doRepost);
  router.route('/repost/:id').get(post.getRepostUsers);
  router.route('/report/posts/:id').put(post.doReport);
  router.route('/like/posts/:id').put(post.doLike);
  router.route('/like/posts/:id').get(post.getLikeUsers);
  router.route('/wish/posts/:id').put(post.doWish);  

  router.route('/images').post(image.doCreate);
  router.route('/images/:id').get(image.getById);

  router.route('/interests').put(interest.doUpdate);

  router.route('/comments/:postId').get(comment.getByPostId);
  router.route('/comments').post(comment.doCreate);

  router.route('/timeline').get(timeline.getTimeline);

  app.use('/api', router);
  app.listen(serverPort, serverIPAddress, function(){
  console.log("Listening on " + serverIPAddress + ", server_port " + serverPort);
  });
