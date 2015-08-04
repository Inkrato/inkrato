var Post = require('../../models/Post');

/**
 * POST /upvote/:id
 */
exports.postUpvote = function(req, res, next) {
  req.assert('id', 'Post ID cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    if (req.xhr || req.api)
      return res.json({ errors: errors });
    req.flash('errors', errors);
    return res.redirect('back');
  }

  Post
  .findOne({ postId: req.params.id })
  .exec(function(err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.status(404).render('404');
    
    post.upvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);
      // If it's an AJAX or API request, return a JSON response
      if (req.xhr || req.api) {
        return res.json({ score: post.upvotes() - post.downvotes(), upvotes: post.upvotes(), downvotes: post.downvotes() });
      } else {
        return res.redirect(req.session.returnTo || post.getUrl());
      }
    });
  });
}

/**
 * POST /downvote/:id
 */
exports.postDownvote = function(req, res, next) {
  req.assert('id', 'Post ID cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    if (req.xhr || req.api)
      return res.json({ errors: errors });
    req.flash('errors', errors);
    return res.redirect('back');
  }

  Post
  .findOne({ postId: req.params.id })
  .exec(function(err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.status(404).render('404');
    
    post.downvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);
      // If it's an AJAX or API request, return a JSON response
      if (req.xhr || req.api) {
        return res.json({ score: post.upvotes() - post.downvotes(), upvotes: post.upvotes(), downvotes: post.downvotes() });
      } else {
        return res.redirect(req.session.returnTo || post.getUrl());
      }
    });
  });
}

/**
 * POST /unvote/:id
 */
exports.postUnvote = function(req, res, next) {
  req.assert('id', 'Post ID cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    if (req.xhr || req.api)
      return res.json({ errors: errors });
    req.flash('errors', errors);
    return res.redirect('back');
  }

  Post
  .findOne({ postId: req.params.id })
  .exec(function(err, post) {
    if (err || (post.deleted && post.deleted == true))
      return res.status(404).render('404');
    
    post.unvote(req.user.id);
    
    post.save(function(err) {
      if (err) return next(err);

      // If it's an AJAX or API request, return a JSON response
      if (req.xhr || req.api) {
        return res.json({ score: post.upvotes() - post.downvotes(), upvotes: post.upvotes(), downvotes: post.downvotes() });
      } else {
        return res.redirect(req.session.returnTo || post.getUrl());
      }
    });
  });
}