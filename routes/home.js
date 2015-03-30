/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  res.render('home', { title: res.locals.title + " - Home" });
};
