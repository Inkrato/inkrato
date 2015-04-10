var Post = require('../models/Post'),
    Site = require('../models/Site');

/**
 * GET /posts/new
 */
exports.getNewPost = function(req, res) {  
  res.render('posts/new', { title: res.locals.title + " - New" });
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
        res.render('posts/list', { title: res.locals.title + " - " + Site.getOptions().post.name, posts: posts, postCount: count, postLimit: numberOfResults, page: pageNumber });
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
 * POST /posts/upvote/:id
 */
exports.postUpvote = function(req, res) {
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
    if (err)
      return res.render('404');
    
    post.upvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);
      return res.redirect(req.session.returnTo || post.getUrl());
    });
    
  });
}

/**
 * POST /posts/downvote/:id
 */
exports.postDownvote = function(req, res) {
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
    if (err)
      return res.render('404');
    
    post.downvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);
      return res.redirect(req.session.returnTo || post.getUrl());
    });

  });
}

/**
 * POST /posts/unvote/:id
 */
exports.postUnvote = function(req, res) {
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
    if (err)
      return res.render('404');
    
    post.unvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);
      return res.redirect(req.session.returnTo || post.getUrl());
    });

  });
}

/**
 * GET /posts/search
 */
exports.getSearch = function(req, res) {
  if (req.query.q) {
    Post
    .search(req.query.q, {}, { sort: { date: -1 }, limit: 100, populate: [{ path: 'creator', fields: 'profile email picture role'} ] },
      function(err, data) {
        var response = {
          title: res.locals.title + " - Search",
          query: req.query.q,
          posts: data.results,
          count: data.totalCount
        };
        if (req.xhr) {
          response.posts = [];
          data.results.forEach(function(post) {
            // To add a .url property to a mongoose object we must clone it
            var newPostObject = JSON.parse(JSON.stringify(post));
            newPostObject.url = post.getUrl();
            response.posts.push(newPostObject);
          });
          return res.json(response);
        } else {
          return res.render('posts/search', response);
       }
      });
  } else {
    var response = {
      title: res.locals.title + " - Search",
      query: '',
      posts: [],
      count: 0
    };
    if (req.xhr) {
      return res.json(response);
    } else {
      return res.render('posts/search', response);
    }
  }
  
};

function splitTags(str) {
  if (!str || str.trim() == '')
    return [];
  
  return str.match(/(".*?"|[^",]+)+(?=,*|,*$)/g).map(function(s) { return s.trim().replace(/(^\"|\"$)/g, '').trim() })
};
