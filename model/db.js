var mongoose = require( 'mongoose' ),
bcrypt = require('bcrypt-nodejs'),
Schema = mongoose.Schema,
dbURI = 'mongodb://localhost/proficioDB';
// dbURI = 'mongodb://walmiki:omongkosong6414@ds047720.mongolab.com:47720/lookatswalmiki';
mongoose.connect(dbURI);

// Connection events snipped out for brevity
/* ********************************************
USER SCHEMA
******************************************** */
var userSchema = new mongoose.Schema({
	username: {type: String, unique:true, required : true},
	password: {type: String, required : true },
	email: {type: String, unique:true, required : true},
	fullname : {type:String, required : true},
	phoneNumber : String,
	avatarThumbnail : {type:Schema.Types.ObjectId, ref:'Image'},
	avatar: {type:Schema.Types.ObjectId, ref:'Image'},
	about : String,
	location : String,
	interests : [String],
	followers : [{ type:Schema.Types.ObjectId, ref:'User' }],
	following : [{ type:Schema.Types.ObjectId, ref:'User'}],
	isActive : { type:Boolean, default: true },
	isPrivate : { type:Boolean, default: false },
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
// Execute before each user.save() call
userSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

// Build the User model
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
// Build the User model
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
// Build the User model
mongoose.model( 'Image', imageSchema );

/* ********************************************
POST SCHEMA
******************************************** */
var postSchema = new mongoose.Schema({
	title: { type: String, required : true },
	image: { type: Schema.Types.ObjectId, required : true, ref:'Image' },
	liked :  [{ type:Schema.Types.ObjectId, ref:'User' }],
	likedNumber : { type: Number, default: 0},
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
// Build the Project model
mongoose.model( 'Post', postSchema );

/* ********************************************
CATEGORY SCHEMA
******************************************** */
var tagSchema = new mongoose.Schema({
	name : String
});
// Build the Project model
mongoose.model( 'Tag', tagSchema );

/* ********************************************
BRAND SCHEMA
******************************************** */
var brandSchema = new mongoose.Schema({
	name : String
});
// Build the Project model
mongoose.model( 'Brand', brandSchema );


/* ********************************************
TAGED BRAND SCHEMA
******************************************** */
var taggedBrandSchema = new mongoose.Schema({
	brand : [{type:Schema.Types.ObjectId, ref:'Brand'}],
	coordinate : [Number]
});
// Build the Project model
// mongoose.model( 'TaggedBrand', postSchema );

/* ********************************************
Following Request SCHEMA
******************************************** */
var followingRequestSchema = new mongoose.Schema({
	following : {type:Schema.Types.ObjectId, ref:'User'},
	follower : {type:Schema.Types.ObjectId, ref:'User'}
});
// Build the Project model
mongoose.model( 'FollowingRequest', followingRequestSchema );

