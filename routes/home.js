var Post = require('../models/Post'),
    Topic = require('../models/Topic'),
    State = require('../models/State'),
    Q = require("q");;

/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  
  var closedStateIds = [];
  var totalOpenPosts = 0;
  
  State
  .find({ deleted: false, open: false })
  .exec(function (err, states) {
    states.forEach(function(state, index) {
      closedStateIds.push(state.id);
    });
  })
  .then(function() {
    // Get the count for the total number of open posts
    var deferred = Q.defer();
    return Post.count({ deleted: false, state: { $ne: closedStateIds } }, function(err, count) {
      totalOpenPosts = count;
      deferred.resolve(totalOpenPosts);
    })
    return deferred.promise;
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
      .then(function(topicsWithPostCount) {
        res.render('home', { title: "Home", topics: topicsWithPostCount, postTotal: totalOpenPosts });
      });
    });
  });
};
