var Site = require('../models/Site'),
    Post = require('../models/Post'),
    State = require('../models/State'),
    Forum = require('../models/Forum'),
    Q = require('q');


/**
 * Return list of forums
 * GET /:forum/
 */
exports.getForums = function(req, res) {
  
  // Get all closed states (to exclude posts with them)
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

        return res.render('forums', { title: Site.options().post.name, forums: forums });
      });
    });
  });
  
};
