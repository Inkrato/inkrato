/**
 * GET /about
 */
exports.getAbout = function(req, res) {
  res.render('about', { title: res.locals.title + " - About" });
};
