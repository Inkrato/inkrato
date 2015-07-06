var Post = require('../../models/Post');

/**
 * POST /favorite/:id
 */
exports.postFavorite = function(req, res, next) {
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
    
    var user = res.locals.user;
    if (!user.favorites)
      user.favorites = [];

    // Add post to favorites only if it doesn't exist in favorites already
    var index = user.favorites.indexOf(post.id);
    if (index == -1)
      user.favorites.push(post.id);
    
    user.save(function(err) {
      if (err) return next(err);
      // If it's an AJAX or API request, return a JSON response
      if (req.xhr || req.api) {
        return res.json();
      } else {
        return res.redirect(req.session.returnTo || post.getUrl());
      }
    });
  });
}

/**
 * POST /unfavorite/:id
 */
exports.postUnfavorite = function(req, res, next) {
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
    
    var user = res.locals.user;
    if (!user.favorites)
      user.favorites = [];
    
    // Remove post id from list of favorites (if found in favorites)
    // while() loop ensures any duplicate references removed
    var i;
    while ((i = user.favorites.indexOf(post.id)) != -1) {
      user.favorites.splice(i, 1);
    };
    
    user.save(function(err) {
      if (err) return next(err);
      // If it's an AJAX or API request, return a JSON response
      if (req.xhr || req.api) {
        return res.json();
      } else {
        return res.redirect(req.session.returnTo || post.getUrl());
      }
    });
  });
}