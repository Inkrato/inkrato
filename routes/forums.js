var Site = require('../models/Site'),
    Forum = require('../models/Forum');

/**
 * Return list of forums
 * GET /:forum/
 */
exports.getForums = function(req, res) {
  return Forum
  .find({ deleted: false }, null, { sort : { order: 1 } })
  .exec(function (err, forums) {
    
    if (req.xhr || req.api)
      return res.json(forums);
    
    return res.render('forums', { title: Site.options().post.name, forums: forums });
  });
};
