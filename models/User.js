var mongoose = require('mongoose'),
    mongooseAutoIncrement = require('mongoose-auto-increment'),
    bcrypt = require('bcrypt-nodejs'),
    crypto = require('crypto');
  
var config = {
  app: require('../config/app'),
  secrets: require('../config/secrets')
};

var schema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  email: { type: String, unique: true, lowercase: true, required: true},
  verified:  { type: Boolean, default: false },
  password: String,
  
  facebook: String,
  twitter: String,
  google: String,
  github: String,
  tokens: Array,

  profile: {
    name: { type: String, default: '' },
    organization: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: String
  },
  
  role: { type: String, enum: ['ADMIN', 'MODERATOR', 'USER'], default: 'USER' },
  
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerificationToken: String,
  
  // If enabled and user is verified will send an email for every notification
  emailNotifications: { type: Boolean, default: true },
  
  apiKey: String,
  
  deleted: { type: Boolean, default: false  },
  
  favorites: { type: mongoose.Schema.ObjectId, ref: 'Post' }
  
});

/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

schema.pre('save', function(next) {
  var user = this;
  
  // If a profile picture is not set OR if it's set to a gravatar, update
  // the users gravatar so it's always consistant with their email address
  if ((this.email && !this.profile.picture) || (this.email && (/https:\/\/gravatar\.com\/avatar\//).test(this.profile.picture))) {
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    this.profile.picture = 'https://gravatar.com/avatar/' + md5;
  }

  mongoose.model('User', schema).count({}, function(err, count) {
    // If there is only user on the site, make them the administrator
    // For initial user to login & if everyone else deletes their accounts
    if (!err && count < 1)
      user.role = 'ADMIN';
    
    // If the password is unchanged, we are done
    if (!user.isModified('password')) return next();

    // If the password has been changed then generate a new hash for it
    bcrypt.genSalt(5, function(err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, null, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  });
  
});

/**
 * Validate user's password.
 * Used by Passport-Local Strategy for password validation.
 */
schema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/**
 * Get URL to a user's avatar.
 * Used in Navbar and Account Management page.
 */

schema.methods.avatar = function(size) {
  // @todo Allow use of imported avatar as well as gravatar
  if (!size) size = 200;
  
  // If their profile picture is an gravatar then return it (after adding size)
  if ((/https:\/\/gravatar\.com\/avatar\//).test(this.profile.picture))
    return this.profile.picture + '?s=' + size + '&d=retro';
  
  // If there is some other profile picture specified, just return it
  if (this.profile.picture)
    return this.profile.picture;

  // If they don't have a profile picture use their email to generate a gravatar
  if (this.email) {
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
  }

  // Fallback option is to generate a gravatar using their UserID
  var md5 = crypto.createHash('md5').update(this.id).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

/**
 * Auto-incrimenting ID value (in addition to _id property)
  */
var connection = mongoose.createConnection(config.secrets.db);
mongooseAutoIncrement.initialize(connection);
schema.plugin(mongooseAutoIncrement.plugin, {
    model: 'User',
    field: 'userId',
    startAt: 1
});

module.exports = mongoose.model('User', schema);