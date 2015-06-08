var Post = require('../models/Post'),
    Topic = require('../models/Topic'),
    State = require('../models/State'),
    Q = require("q");;

/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  Topic
  .find({ deleted: false }, null, { sort : { order: 1 } })
  .exec(function (err, topics) {
    Q.all(topics.map(function(topic) {
      var deferred = Q.defer();
      
      // Get the count counts for all posts in a non-closed state
      State
      .find({ deleted: false, open: false })
      .exec(function (err, states) {
        
        var closedStateIds = [];
        states.forEach(function(state, index) {
          closedStateIds.push(state.id);
        });
        
        Post.count({ topic: topic._id, state: { $ne: closedStateIds } }, function(err, count) {
          topic.postCount = count;
          deferred.resolve(topic);
        });

      });
      return deferred.promise;
    }))
    .then(function(topicsWithPostCount) {
      res.render('home', { title: res.locals.title + " - Home", topics: topicsWithPostCount });
    });
  });
};
