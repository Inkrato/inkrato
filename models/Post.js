var mongoose = require('mongoose'),
    mongooseAutoIncrement = require('mongoose-auto-increment'),
    mongooseSearch = require('mongoose-search-plugin'),
    mongooseVoting = require('mongoose-voting'),
    mongooseConverse = require('../lib/mongoose-converse'),
    User = require('./User'),
    Site = require('./Site'),
    Topic = require('./Topic'),
    crypto = require('crypto'),
    slug = require('slug');

var config = {
  app: require('../config/app'),
  secrets: require('../config/secrets')
};

var schema = new mongoose.Schema({
  postId: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [ String ],
  topic: { type: mongoose.Schema.ObjectId, ref: 'Topic' },
  label: { type: mongoose.Schema.ObjectId, ref: 'Label' },
  state: { type: mongoose.Schema.ObjectId, ref: 'State' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  creator: { type: mongoose.Schema.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false  }
});

/**
 * Update the date on a post when it is modifeid
 */
schema.pre('save', function(next) {
  if (!this.isNew)
    this.updated = new Date();

  next();
});

schema.methods.getUrl = function() {
  // If topic not found, use "everything" as topic path (works for all posts)
  var topicPath = 'everything';
  if (this.topic)
    topicPath = this.topic.path;
  
  return Site.options().post.path+'/'+topicPath+'/'+this.postId+'/'+slug(this.title.toLowerCase());
};

schema.methods.getEditUrl = function() {
  // If topic not found, use "everything" as topic path (works for all posts)
  var topicPath = 'everything';
  if (this.topic)
    topicPath = this.topic.path;

  return Site.options().post.path+'/'+topicPath+'/edit/'+this.postId;
};

schema.methods.getUpvoteUrl = function() {
  return '/upvote/'+this.postId;
};

schema.methods.getDownvoteUrl = function() {
  return '/downvote/'+this.postId;
};

schema.methods.getUnvoteUrl = function() {
  return '/unvote/'+this.postId;
};

schema.methods.getAddCommentUrl = function() {
  return '/comments/add/'+this.postId;
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