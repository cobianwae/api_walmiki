var mongoose = require( 'mongoose' ),
bcrypt = require('bcrypt-nodejs'),
Schema = mongoose.Schema,
dbName = typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV == 'test' ? 'lookatsTest' : 'lookats',
dbURI = 'mongodb://localhost/' + dbName;

if (process.env.OPENSHIFT_MONGODB_DB_URL){
  dbURI = process.env.OPENSHIFT_MONGODB_DB_URL + dbName;
  //dbURI = 'mongodb://walmiki:omongkosong6414@ds047720.mongolab.com:47720/lookatswalmiki';
}
mongoose.connect(dbURI);

/* ********************************************
USER SCHEMA
******************************************** */
var userSchema = new mongoose.Schema({
  email: {type: String, unique:true, required : true},
	username: {type: String, unique:true, required : true},
	password: {type: String, required : true },
	fullname : {type:String, required : true},
	phoneNumber : String,
	avatarThumbnail : {type:Schema.Types.ObjectId, ref:'Image'},
	avatar: {type:Schema.Types.ObjectId, ref:'Image'},
  cover: {type:Schema.Types.ObjectId, ref:'Image'},
	about : String,
	location : String,
	interests : [String],
	followers : [{ type:Schema.Types.ObjectId, ref:'User' }],
	following : [{ type:Schema.Types.ObjectId, ref:'User'}],
	isActive : { type:Boolean, default: true },
	isPrivate : { type:Boolean, default: false },
  type : {type : String, required:true, default: 'member'},
	createdOn: { type: Date, default: Date.now },
	modifiedOn: { type: Date, default: Date.now },
	modifiedOn: { type: Date, default: Date.now }
});
userSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};
userSchema.pre('save', function(callback) {
  var user = this;
  if (!user.isModified('password')) return callback();
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});
mongoose.model( 'User', userSchema );

/* ********************************************
COMMENT SCHEMA
******************************************** */
var commentSchema = new mongoose.Schema({
	text : String,
	voteUp : Number,
	voteDown : Number,
	author : { type:Schema.Types.ObjectId, ref:'User' },
	createdOn: { type: Date, default: Date.now },
	modifiedOn: Date,
});
mongoose.model( 'Comment', commentSchema );

/* ********************************************
IMAGE SCHEMA
******************************************** */
var imageSchema = new mongoose.Schema({
	data : Buffer,
	filename : String,
	contentType : String,
	createdOn: { type: Date, default: Date.now },
	modifiedOn: Date
});
mongoose.model( 'Image', imageSchema );

/* ********************************************
POST SCHEMA
******************************************** */
var postSchema = new mongoose.Schema({
	title: { type: String, required : true },
	image: { type: Schema.Types.ObjectId, required : true, ref:'Image' },
	liked :  [{ type:Schema.Types.ObjectId, ref:'User' }],
	likedNumber : { type: Number, default: 0},
  wished : [{ type:Schema.Types.ObjectId, ref:'User' }],
  wishedNumber : { type:Number, default:0 },
	isActive : { type: Boolean, default:true },
	brands :  [taggedBrandSchema],
	comment : [commentSchema],
	commentNumber : { type: Number, default:0 },
	tags : [{type:Schema.Types.ObjectId, ref:'Tag'}],
  taggedUsers : [{ type:Schema.Types.ObjectId, ref:'User' }],
	author : { type:Schema.Types.ObjectId, ref:'User', required : true },
	createdOn: { type: Date, default: Date.now },
	modifiedOn: Date,
	originalPost : {type:Schema.Types.ObjectId, ref:'Post'},
	reposted :[{type:Schema.Types.ObjectId, ref:'User'}],
	repostedNumber : {type:Number, default:0}
});
mongoose.model( 'Post', postSchema );

/* ********************************************
Recommended Post SCHEMA
******************************************** */
var recommendedPostSchema = new mongoose.Schema({
  brand : { type: Schema.Types.ObjectId, required : true, ref:'User' },
  post : { type: Schema.Types.ObjectId, required : true, ref:'Post' }
});
mongoose.model( 'RecommendedPost', postSchema );

/* ********************************************
CATEGORY SCHEMA
******************************************** */
var tagSchema = new mongoose.Schema({
	name : String
});
mongoose.model( 'Tag', tagSchema );

/* ********************************************
BRAND SCHEMA
******************************************** */
// var brandSchema = new mongoose.Schema({
// 	name : String
// });
// mongoose.model( 'Brand', brandSchema );

/* ********************************************
TAGED BRAND SCHEMA
******************************************** */
var taggedBrandSchema = new mongoose.Schema({
	brand : [{type:Schema.Types.ObjectId, ref:'User'}],
	coordinate : [Number]
});

/* ********************************************
Following Request SCHEMA
******************************************** */
var followingRequestSchema = new mongoose.Schema({
	following : {type:Schema.Types.ObjectId, ref:'User'},
	follower : {type:Schema.Types.ObjectId, ref:'User'}
});
mongoose.model( 'FollowingRequest', followingRequestSchema );
