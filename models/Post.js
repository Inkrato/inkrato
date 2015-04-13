var mongoose = require('mongoose'),
    mongooseAutoIncrement = require('mongoose-auto-increment'),
    mongooseSearch = require('mongoose-search-plugin'),
    mongooseVoting = require('mongoose-voting'),
    mongooseConverse = require('../lib/mongoose-converse'),
    User = require('./User'),
    Site = require('./Site'),
    crypto = require('crypto'),
    slug = require('slug');

var config = {
  app: require('../config/app'),
  secrets: require('../config/secrets')
};

var schema = new mongoose.Schema({
  postId: { type: Number, unique: true },
  title: { type: String, required : true },
  description: { type: String, required : true },
  tags: [ String ],
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  creator: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

/**
 * Update the date on a post when it is modifeid
 */
schema.pre('save', function(next) {
  if (this.isNew) {
    next();
  } else {
    this.updated = new Date();
    next();
  }
});

schema.methods.getUrl = function() {
  return '/'+Site.getOptions().post.url+'/'+this.postId+'/'+slug(this.title.toLowerCase());
};

schema.methods.getEditUrl = function() {
  return '/'+Site.getOptions().post.url+'/edit/'+this.postId;
};

schema.methods.getUpvoteUrl = function() {
  return '/'+Site.getOptions().post.url+'/upvote/'+this.postId;
};

schema.methods.getDownvoteUrl = function() {
  return '/'+Site.getOptions().post.url+'/downvote/'+this.postId;
};

schema.methods.getUnvoteUrl = function() {
  return '/'+Site.getOptions().post.url+'/unvote/'+this.postId;
};

schema.methods.getAddCommentUrl = function() {
  return '/'+Site.getOptions().post.url+'/comments/add/'+this.postId;
};

/**
 * Auto-incrimenting ID value (in addition to _id property)
  */
var connection = mongoose.createConnection(config.secrets.db); 
mongooseAutoIncrement.initialize(connection);
schema.plugin(mongooseAutoIncrement.plugin, {
    model: 'Post',
    field: 'postId',
    startAt: 1
});

schema.plugin(mongooseSearch, {
  fields: ['title', 'description', 'tags']
});
schema.plugin(mongooseVoting, { ref: 'User' });
schema.plugin(mongooseConverse, { ref: 'User'});

module.exports = mongoose.model('Post', schema);