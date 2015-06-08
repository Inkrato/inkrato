var Post = require('../../models/Post');

/**
 * POST /posts/comments/add/:id
 */
exports.postAddComment = function(req, res, next) {
  req.assert('id', 'Post ID cannot be blank').notEmpty();
  req.assert('comment', 'Comment cannot be blank').notEmpty();

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
    
    post.addComment(req.user.id, req.body.comment, function(err) {
      if (err) return next(err);
      return res.redirect(post.getUrl());
    });
  });
};