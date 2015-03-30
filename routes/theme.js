/**
 * POST /theme
 * Change the theme for the current user
 */
exports.postTheme = function(req, res, next) {
  if (req.body['theme-name']) {
    req.session.theme = req.body['theme-name'];
  } else {
    req.session.theme = null; 
  }
  res.redirect(req.session.returnTo || '/');
};
