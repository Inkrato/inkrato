var mongoose = require('mongoose'),
    mongooseAutoIncrement = require('mongoose-auto-increment'),
    mongooseSearch = require('mongoose-search-plugin'),
    mongooseVoting = require('mongoose-voting'),
    mongooseConverse = require('../lib/mongoose-converse'),
    mongooseMoreLikeThis = require('mongoose-mlt'),
    User = require('./User'),
    Site = require('./Site'),
    Notification = require('./Notification'),
    crypto = require('crypto'),
    slug = require('slug');

var config = {
  app: require('../config/app'),
  secrets: require('../config/secrets')
};

var schema = new mongoose.Schema({
  postId: { type: Number, unique: true },
  summary: { type: String, required: true },
  detail: { type: String, required: true },
  tags: [ String ],
  forum: { type: mongoose.Schema.ObjectId, ref: 'Forum' },
  topic: { type: mongoose.Schema.ObjectId, ref: 'Topic' },
  state: { type: mongoose.Schema.ObjectId, ref: 'State' },
  priority: { type: mongoose.Schema.ObjectId, ref: 'Priority' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  creator: { type: mongoose.Schema.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false  }
});

/**
 * Update the date on a post when it is modified
 */
schema.pre('save', function(next) {
  if (!this.isNew) {
    this.updated = new Date();
    
    // Get every user that has this post in their favorites
    // @TODO Design still in progress - not yet ready for use.
    /* 
    var stream = User.find({ deleted: false, 'favourites': { $in: [this.id] } }).stream();
    stream.on('data', function (user) {
      var notification = Notification({
        user: user.id,
        subject: "",
        message: "message",
        type: "POST",
        post: this.id
      });
      notification.save();
    });
    */
  }

  next();
});

schema.methods.getUrl = function() {
  // If topic not found, use "everything" as topic slug
  var topicSlug = 'everything';
  // Graceful handling of deleted topics
  if (this.topic && !/undefined/.test(this.topic.slug))
    topicSlug = this.topic.slug;
  
  var root = Site.options().post.slug;
  if (GLOBAL.forums.length > 0 && this.forum && !/undefined/.test(this.forum.slug))
    root += '/'+this.forum.slug;
  
  var path = '/'+root+'/'+topicSlug+'/'+this.postId+'/';
  
  if (this.deleted != true)
    path += slug(this.summary.toLowerCase());
  
  return path;
};

schema.methods.getEditUrl = function() {
  // If topic not found, use "everything" as topic slug
  var topicSlug = 'everything';
  if (this.topic && !/undefined/.test(this.topic.slug))
    topicSlug = this.topic.slug;

  var root = Site.options().post.slug;
  if (GLOBAL.forums.length > 0 && this.forum && !/undefined/.test(this.forum.slug))
    root += '/'+this.forum.slug;

  return '/'+root+'/'+topicSlug+'/edit/'+this.postId;
};

schema.methods.getDeleteUrl = function() {
  // If topic not found, use "everything" as topic slug
  var topicSlug = 'everything';
  if (this.topic && !/undefined/.test(this.topic.slug))
    topicSlug = this.topic.slug;

  var root = Site.options().post.slug;
  if (GLOBAL.forums.length > 0 && this.forum && !/undefined/.test(this.forum.slug))
    root += '/'+this.forum.slug;

  return '/'+root+'/'+topicSlug+'/delete/'+this.postId;
};

schema.methods.getUndeleteUrl = function() {
  // If topic not found, use "everything" as topic slug
  var topicSlug = 'everything';
  if (this.topic && !/undefined/.test(this.topic.slug))
    topicSlug = this.topic.slug;

  var root = Site.options().post.slug;
  if (GLOBAL.forums.length > 0 && this.forum && !/undefined/.test(this.forum.slug))
    root += '/'+this.forum.slug;

  return '/'+root+'/'+topicSlug+'/undelete/'+this.postId;
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

schema.methods.getFavoriteUrl = function() {
  return '/favorite/'+this.postId;
};

schema.methods.getUnfavoriteUrl  = function() {
  return '/unfavorite/'+this.postId;
};

schema.methods.getAddCommentUrl = function() {
  return '/comments/add/'+this.postId;
};

schema.methods.getScore = function() {
  return this.upvotes() - this.downvotes();
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
  fields: ['summary', 'detail', 'tags']
});
schema.plugin(mongooseVoting, { ref: 'User' });
schema.plugin(mongooseConverse, { ref: 'User'});

schema.index({ 'summary': 'text', 'detail': 'text' });
schema.plugin(mongooseMoreLikeThis, {
  limit: 100,
  tfThreshold: 2,
  termLimit: 25
});

module.exports = mongoose.model('Post', schema);