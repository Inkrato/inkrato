var Post = require('../models/Post'),
    User = require('../models/Post');

/**
 * GET /posts/new
 */
exports.getNewPost = function(req, res) {  
  res.render('posts/new', { title: res.locals.title + " - New post" });
};

/**
 * POST /posts/new
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

  post.save(function(err) {
    if (err) return next(err);
    return res.redirect(post.getUrl());
  });

};

/**
 * GET /posts
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
  
  Post
  .find({}, null , { skip: skip, limit: numberOfResults, sort : { _id: -1 } })
  .populate('creator', 'profile email picture role')
  .exec(function (err, posts) {
    Post.count({}, function(err, count) {
        res.render('posts/list', { title: res.locals.title + " - Posts", posts: posts, postCount: count, postLimit: numberOfResults, page: pageNumber });
    });
  });
  
};

/**
 * GET /posts/:id
 */
exports.getPost = function(req, res) {
  var postId = req.params.id;
  
  Post
  .findOne({ postId: postId })
  .populate('creator', 'profile email picture role')
  .exec(function (err, post) {
    if (err)
      return res.render('404');
    
    return res.render('posts/view', { title: res.locals.title + " - " + post.title, post: post });
  });
};


/**
 * GET /posts/edit/:id
 */
exports.getEditPost = function(req, res) {
  var postId = req.params.id;

  Post
  .findOne({ postId: postId })
  .populate('creator', 'profile email picture role')
  .exec(function (err, post) {
    if (err)
      return res.render('404');

    if ((post.creator && req.user.id != post.creator.id)
        && req.user.role != 'MODERATOR'
        && req.user.role != 'ADMIN')
      return res.render('403');
    
    return res.render('posts/edit', { title: res.locals.title + " - Edit " + post.title, post: post });
  });
};

/**
 * POST /posts/edit/:id
 */
exports.postEditPost = function(req, res) {
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
  .exec(function (err, post) {
    if (err)
      return res.render('404');
    
    if ((post.creator && req.user.id != post.creator.id)
        && req.user.role != 'MODERATOR'
        && req.user.role != 'ADMIN')
      return res.render('403');
    
    post.title = req.body.title;
    post.description = req.body.description;
    post.tags = splitTags(req.body.tags);
    
    post.save(function(err) {
      if (err) return next(err);
      return res.redirect(post.getUrl());
    });
      
  });
  
};

/**
 * GET /posts/search
 */
exports.getSearch = function(req, res) {
  
  if (req.query.q) {
    Post
    .search(req.query.q, {}, { sort: { date: -1 }, limit: 50, populate: [{ path: 'creator', fields: 'profile email picture role'} ] },
      function(err, data) {
        res.render('posts/search', { title: res.locals.title + " - Search",
                                     query: req.query.q,
                                     results: data.results,
                                     count: data.totalCount
                                   });
      });
  } else {
    res.render('posts/search', { title: res.locals.title + " - Search",
                                 query: '',
                                 results: []
                               });
  }
  
};

function splitTags(str) {
  if (!str || str.trim() == '')
    return [];
  
  return str.match(/(".*?"|[^",]+)+(?=,*|,*$)/g).map(function(s) { return s.trim().replace(/(^\"|\"$)/g, '').trim() })
};
