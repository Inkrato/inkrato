var Forum = require('../models/Forum'),
    Post = require('../models/Post'),
    Topic = require('../models/Topic'),
    State = require('../models/State'),
    Q = require("q");;

/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
   Forum
  .find({ deleted: false }, null, { sort : { order: 1 } })
  .exec(function (err, forums) {
    if (forums && forums.length > 0) {
      return _listForums(req, res);
    } else {
      return _listTopics(req, res);
    }
  });
};

function _listTopics(req, res) {
  // Get all closed states (so we only count open posts)
  var closedStateIds = [];
  State
  .find({ deleted: false, open: false })
  .exec(function (err, states) {
    states.forEach(function(state, index) {
      closedStateIds.push(state.id);
    });
  })
  .then(function() {
    Topic
    .find({ deleted: false }, null, { sort : { order: 1 } })
    .exec(function (err, topics) {
      Q.all(topics.map(function(topic) {
        var deferred = Q.defer();
        Post.count({ topic: topic._id, state: { $ne: closedStateIds } }, function(err, count) {
          topic.postCount = count;
          deferred.resolve(topic);
        });
        return deferred.promise;
      }))
      .then(function(topics) {
        res.render('home', { topics: topics });
      });
    });
  });
  
};

function _listForums(req, res) {
  // Get all closed states (so we only count open posts)
  var closedStateIds = [];
  State
  .find({ deleted: false, open: false })
  .exec(function(err, states) {
    states.forEach(function(state, index) {
      closedStateIds.push(state.id);
    });
  })
  .then(function() {
     Forum
    .find({ deleted: false }, null, { sort : { order: 1 } })
    .exec(function (err, forums) {
      // Get all open posts on this forum
      Q.all(forums.map(function(forum) {
        var deferred = Q.defer();
        var query = { forum: forum._id, state: { $ne: closedStateIds } };
        Post.count(query, function(err, count) {
          forum.postCount = count;
          deferred.resolve(forum);
        });
        return deferred.promise;
      }))
      .then(function(forums) {
        if (req.xhr || req.api)
          return res.json(forums);

        return res.render('home', { forums: forums });
      });
    });
  });
};









