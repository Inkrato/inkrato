var Post = require('../models/Post'),
    Topic = require('../models/Topic'),
    State = require('../models/State'),
    Site = require('../models/Site'),
    postsSearch = require('./posts/search'),
    postsComments = require('./posts/comments'),
    Q = require("q");


/**
 * Return list of topics
 * GET /posts/
 */
exports.getTopics = function(req, res) {
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
      res.render('posts/topics', { title: res.locals.title + " - " + Site.options().post.name, topics: topicsWithPostCount });
    });
  });
};

/**
 * GET /posts/:topic
 */
exports.getPosts = function(req, res) {
  var numberOfResultsLimit = 100;
  var numberOfResults = 10;
  if (numberOfResults > numberOfResultsLimit)
    numberOfResults = numberOfResultsLimit;
  
  var pageNumber = (parseInt(req.query.page) > 1) ? parseInt(req.query.page) : 1;

  var skip = 0;
  if (pageNumber > 1)
    skip = (pageNumber - 1) * numberOfResults;
  
  // If topic is "everything" show all posts
  if (req.params.topic == "everything") {
    State
    .find({ deleted: false, open: false })
    .exec(function (err, states) {
      
      var closedStateIds = [];
      states.forEach(function(state, index) {
        closedStateIds.push(state.id);
      });

      Post
      .find({ deleted: false, state: { $ne: closedStateIds } }, null, { skip: skip, limit: numberOfResults, sort : { _id: -1 } })
      .populate('creator', 'profile email picture role')
      .populate('topic')
      .populate('state')
      .populate('priority')
      .exec(function (err, posts) {
        Post.count({}, function(err, count) {
            res.render('posts/list', { title: res.locals.title + " - " + Site.options().post.name,
                                       topic: null,
                                       posts: posts,
                                       postCount: count,
                                       postLimit: numberOfResults,
                                       page: pageNumber
            });
        });
      });
      
    });
  } else {
    Topic
    .findOne({ path: encodeURI(req.params.topic) })
    .exec(function (err, topic) {
    
      if (err) return next(err);
    
      // If Topic not found return 404
      if (!topic)
        return res.render('404');
      
      State
      .find({ deleted: false, open: false })
      .exec(function (err, states) {
        
        var closedStateIds = [];
        states.forEach(function(state, index) {
          closedStateIds.push(state.id);
        });
        
        Post
        .find({ topic: topic._id, deleted: false, state: { $ne: closedStateIds } }, null, { skip: skip, limit: numberOfResults, sort : { _id: -1 } })
        .populate('creator', 'profile email picture role')
        .populate('topic')
        .populate('state')
        .populate('priority')
        .exec(function (err, posts) {
          Post.count({ topic: topic._id, deleted: false }, function(err, count) {
              res.render('posts/list', { title: res.locals.title + " - " + Site.options().post.name,
                                         topic: topic,
                                         posts: posts,
                                         postCount: count,
                                         postLimit: numberOfResults,
                                         page: pageNumber
              });
          });
        });
      });
      
    });
  }
};

/**
 * GET /posts/:topic/new
 */
exports.getNewPost = function(req, res) {
  if (req.params.topic) {
    Topic
    .findOne({ path: encodeURI(req.params.topic) })
    .exec(function (err, topic) {

      if (err) return next(err);
      res.render('posts/new', { title: res.locals.title + " - New", topic: topic, post: new Post() });
    });
  } else {
    res.render('posts/new', { title: res.locals.title + " - New", topic: null, post: new Post() });
  }

};

/**
 * POST /posts/:topic/new
 */
exports.postNewPost = function(req, res, next) {
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('description', 'Description cannot be blank').notEmpty();
  
  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    req.flash('errors', errors);
    return res.render('posts/new');
  }

  var post = new Post({
    title: req.body.title,
    description: req.body.description,
    tags: splitTags(req.body.tags),
    creator: req.user.id
  });
  
  if (req.body.topic)
    post.topic = req.body.topic;

  if (req.body.state)
    post.state = req.body.state;

  if (req.body.priority)
    post.priority = req.body.priority;
  
  post.save(function(err) {
    if (err) return next(err);

    // Fetch back from DB so topic is properly populated for the page template
    Post
    .findOne({ postId: post.postId })
    .populate('topic')
    .exec(function (err, post) {
      return res.redirect(post.getUrl());
    });
    
  });
};

/**
 * GET /posts/:topic/:id
 */
exports.getPost = function(req, res) {
  var postId = req.params.id;
  
  Post
  .findOne({ postId: postId })
  .populate('creator', 'profile email picture role')
  .populate('comments.creator', 'profile email picture role')
  .populate('topic')
  .populate('state')
  .populate('priority')
  .exec(function (err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.render('404');
    
    return res.render('posts/view', { title: res.locals.title + " - " + post.title, post: post, topic: post.topic });
  });
};

/**
 * GET /posts/:topic/edit/:id
 */
exports.getEditPost = function(req, res) {
  var postId = req.params.id;

  Post
  .findOne({ postId: postId })
  .populate('creator', 'profile email picture role')
  .populate('comments.creator', 'profile email picture role')
  .populate('topic')
  .populate('state')
  .populate('priority')
  .exec(function (err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.render('404');

    if ((post.creator && req.user.id != post.creator.id)
        && req.user.role != 'MODERATOR'
        && req.user.role != 'ADMIN')
      return res.render('403');
    
    return res.render('posts/edit', { title: res.locals.title + " - Edit " + post.title, post: post, topic: post.topic });
  });
};

/**
 * POST /posts/:topic/edit/:id
 */
exports.postEditPost = function(req, res, next) {
  req.assert('id', 'Post ID cannot be blank').notEmpty();
  req.assert('title', 'Title cannot be blank').notEmpty();
  req.assert('description', 'Description cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }
  
  Post
  .findOne({ postId: req.params.id })
  .populate('creator', 'profile email picture role')
  .populate('topic')
  .populate('state')
  .populate('priority')
  .exec(function (err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.render('404');
    
    if ((post.creator && req.user.id != post.creator.id)
        && req.user.role != 'MODERATOR'
        && req.user.role != 'ADMIN')
      return res.render('403');
    
    post.title = req.body.title;
    post.description = req.body.description;
    post.tags = splitTags(req.body.tags);
    
    if (req.body.topic)
      post.topic = req.body.topic;

    if (req.body.state)
      post.state = req.body.state;

    if (req.body.priority)
      post.priority = req.body.priority;
    
    post.save(function(err) {
      if (err) return next(err);
      // Fetch back from DB so topic is properly populated for the page template
      Post
      .findOne({ postId: post.postId })
      .populate('topic')
      .exec(function (err, post) {
        return res.redirect(post.getUrl());
      });
    });
      
  });
};

/**
 * POST /posts/:topic/upvote/:id
 */
exports.postUpvote = function(req, res, next) {
  req.assert('id', 'Post ID cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  Post
  .findOne({ postId: req.params.id })
  .exec(function (err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.render('404');
    
    post.upvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);
      // If it's an ajax request, return a json response
      if (req.xhr) {
        return res.json({ score: post.upvotes() - post.downvotes() });
      } else {
        return res.redirect(req.session.returnTo || post.getUrl());
      }
    });
  });
}

/**
 * POST /posts/:topic/downvote/:id
 */
exports.postDownvote = function(req, res, next) {
  req.assert('id', 'Post ID cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  Post
  .findOne({ postId: req.params.id })
  .exec(function (err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.render('404');
    
    post.downvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);
      // If it's an ajax request, return a json response
      if (req.xhr) {
        return res.json({ score: post.upvotes() - post.downvotes() });
      } else {
        return res.redirect(req.session.returnTo || post.getUrl());
      }
    });
  });
}

/**
 * POST /posts/:topic/unvote/:id
 */
exports.postUnvote = function(req, res, next) {
  req.assert('id', 'Post ID cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  Post
  .findOne({ postId: req.params.id })
  .exec(function (err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.render('404');
    
    post.unvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);

      // If it's an ajax request, return a json response
      if (req.xhr) {
        return res.json({ score: post.upvotes() - post.downvotes() });
      } else {
        return res.redirect(req.session.returnTo || post.getUrl());
      }
    });
  });
}

/**
 * Routes for /posts/:topic/search/*
 */
exports.search = postsSearch;

/**
 * Routes for /posts/:topic/comments/*
 */
exports.comments = postsComments;

function splitTags(str) {
  if (!str || str.trim() == '')
    return [];
  
  return str.match(/(".*?"|[^",]+)+(?=,*|,*$)/g).map(function(s) { return s.trim().replace(/(^\"|\"$)/g, '').trim() })
};
