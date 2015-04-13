/**
 * Inspired by
 * https://github.com/daemon1981/mongoose-rattle-plugin
 * 
 * Portions copyright (c) 2013-2014 Damien Saillard, Inc
 * https://github.com/daemon1981/mongoose-rattle-plugin/blob/master/LICENSE
 *
 * Converted to JavaScript (from CoffeeScript) and refactored/stripped.
 * Once it's been expanded & tests written should be published to npmjs.org
 */
var mongoose = require('mongoose');

module.exports = function(schema, options) {
  
  if (!options)
    options = {};
  
  if (!options.ref)
    options.ref = 'User';

  if (!options.UserIdType)
    options.UserIdType = mongoose.Schema.Types.ObjectId;

  var CommentSchema = new mongoose.Schema({
    message: {
      type: String,
      required: true,
      max: 2000,
      min: 1
    },
    creator: {
      type: options.UserIdType,
      ref: options.ref,
      required: true
    },
    created: { type: Date },
    updated: { type: Date }
  });
  
  schema.add({
    comments: [CommentSchema]
  });
  
  schema.pre("save", function(next) {
    if (this.isNew) {
      this.emit('objectCreation', this._id, this, this.creator);
      this.created = new Date();
    }
    this.updated = new Date();
    return next();
  });
  CommentSchema.pre("save", function(next) {
    return next();
  });

  /**
   * Get the list of conversations with limited amount of comments
   *
   * @param {Number} num - number of conversations
   * @param {Number} maxLastComments - number max of comments retrieved
   * @param {Object} options:
   *                   fromDate: creation date from which we retrieve conversations
   *                   populate:         list of fields to populate (example: 'fieldName' or 'fieldName1 fieldName2')
   * @callback(err, conversations)
   */
  schema.statics.getListOfConversations = function(num, maxLastComments, options, callback) {
    var fields, query;
    if (!options)
      options = {};    
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    query = {};
    if (options.fromDate) {
      query = {
        created: {
          $lt: options.fromDate
        }
      };
    }
    fields = {
      message: 1,
      creator: 1,
      created: 1,
      updated: 1
    };
    if (maxLastComments > 0) {
      fields.comments = {
        $slice: [-maxLastComments, maxLastComments]
      };
    }
    query = this.find(query, fields).sort('-created').limit(num);
    if (options.populate) {
      query.populate(options.populate);
    }
    return query.exec(callback);
  };

  /**
   * Get the list of comments from a conversation id
   *
   * @param {Number} conversationId - id of the conversation
   * @param {Number} num - number of comments required
   * @param {Number} offsetFromEnd - offset from end of the list of comments
   * @callback(err, comments)
   */
  schema.statics.getListOfCommentsById = function(conversationId, num, offsetFromEnd, callback) {
    var self;
    self = this;
    return this.aggregate({
      $unwind: "$comments"
    }, {
      $group: {
        _id: '',
        count: {
          $sum: 1
        }
      }
    }, function(err, summary) {
      var diff, fields, limit, start;
      start = -num - offsetFromEnd;
      limit = num;
      if (summary[0].count < Math.abs(start)) {
        diff = Math.abs(start) - summary[0].count;
        start += diff;
        limit -= diff;
      }
      if (limit <= 0) {
        return callback(null, []);
      }
      fields = {
        comments: {
          $slice: [start, limit]
        }
      };
      return self.findById(conversationId, fields).exec(function(err, conversation) {
        if (err) {
          return callback(err);
        }
        return callback(null, conversation.comments);
      });
    });
  };

  /**
   * Emit an event
   *
   * @param {String} eventName - event name
   * @param {Number} targetId  - object to which the event occured
   * @param {Object} resource  - object from which the event occured
   * @param {Number} actor     - actor who triggered the event
   */
  schema.methods.emit = function(eventName, targetId, resource, actor) {
    if (options.emitter) {
      return options.emitter.emit(eventName, targetId, resource, actor);
    }
  };

  /**
   * Add a comment
   *
   * @param {Number} userId  - user id adding comment
   * @param {String} message - comment text
   * @callback(err, updatedConversation)
   */
  schema.methods.addComment = function(userId, message, callback) {
    var comment,
        self = this;

    comment = {
      message: message,
      creator: userId,
      created: new Date(),
      updated: new Date(),
    };
    this.comments.push(comment);
    this.save(function(err, updatedConversation) {
      if (err !== null) return callback(err);

      self.emit('addComment', comment._id, self, userId);
      return callback(err, updatedConversation);
    });
    return this.comments[this.comments.length - 1]._id;
  };

  /**
   * Add a reply to a comment
   *
   * @param {Number} userId    - user id replying to the comment
   * @param {Number} commentId - comment id on which the user reply
   * @param {String} message   - comment text
   * @callback(err, updatedConversation)
   */
  schema.methods.addReplyToComment = function(userId, commentId, message, callback) {
    var comment, reply, self;
    comment = this.getComment(commentId);
    if (!comment) {
      return callback(new Error('Comment doesn\'t exist'));
    }
    self = this;
    reply = {
      message: message,
      creator: userId,
      created: new Date(),
      updated: new Date()
    };
    comment.comments.push(reply);
    this.save(function(err, updatedConversation) {
      if (err !== null) {
        return callback(err);
      }
      self.emit('addReplyToComment', reply._id, comment, userId);
      return callback(err, updatedConversation);
    });
    return comment.comments[comment.comments.length - 1]._id;
  };

  /**
   * Edit a comment
   *
   * @param {Number} userId    - user id editing the comment
   * @param {Number} commentId - comment id on which the user edit
   * @param {String} message   - comment text
   * @callback(err, updatedConversation)
   */
  schema.methods.editComment = function(userId, commentId, message, callback) {
    var comment, self;
    comment = this.getComment(commentId);
    if (!comment)
      return callback(new Error('Comment doesn\'t exist'));

    if (String(comment.creator) !== String(userId))
      return callback(new Error('Only owner can edit comment'));

    comment.message = message;
    comment.updated = new Date();
    self = this;
    this.save(function(err, updatedConversation) {
      if (err !== null) {
        return callback(err);
      }
      self.emit('editComment', comment._id, self, userId);
      return callback(err, updatedConversation);
    });
    return this.comments[this.comments.length - 1]._id;
  };

  /**
   * Remove a comment
   *
   * @param {Number} userId    - user id removing the comment
   * @param {Number} commentId - comment id removed
   * @callback(err, updatedConversation)
   */
  schema.methods.removeComment = function(userId, commentId, callback) {
    var found, self;
    if (!this.getComment(commentId)) {
      return callback(new Error('Comment doesn\'t exist'));
    }
    found = false;
    this.comments = this.comments.filter(function(comment) {
      var keep;
      keep = String(comment.creator) !== String(userId) || String(comment._id) !== String(commentId);
      found = found || !keep;
      return keep;
    });
    if (!found) {
      return callback(new Error('Comment not found among creator\'s comments'), this);
    }
    self = this;
    return this.save(function(err, updatedConversation) {
      if (err !== null) {
        return callback(err);
      }
      self.emit('removeComment', self._id, self, userId);
      return callback(err, updatedConversation);
    });
  };

  /**
   * Get comment by id
   *
   * @param {Number} commentId - comment id to be retrieved
   * @return {Object} comment found
   */
  return schema.methods.getComment = function(commentId) {
    var comment, _i, _len, _ref;
    _ref = this.comments;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      comment = _ref[_i];
      if (String(comment._id) === String(commentId)) {
        return comment;
      }
    }
    return null;
  };
};