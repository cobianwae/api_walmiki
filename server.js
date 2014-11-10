var express    = require('express');
var app        = express();
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var db 	= require('./model/db');
var user = require('./routes/user');
var post = require('./routes/post');

app.use(expressJwt({secret : 'lookats-05112014162539'}).unless({path:['/api/authenticate', '/api/register']}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 9090;
var router = express.Router();

router.route('/authenticate').post(user.authenticate);
router.route('/register').post(user.doCreate);

router.route('/user').put(user.doUpdate);
router.route('/user').get(user.getById);
router.route('/user/interests').put(user.doUpdateInterests);

router.route('/post').post(post.doCreate);

// router.route('/user/recommenduser').get(user.getReccommendUser);
// router.route('/user/follow').put(user.doFollow);
// router.route('/user/unfollow').put(user.doUnfollow);

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);
