var Post = require('../../models/Post');

/**
 * GET /posts/search
 */
exports.getSearch = function(req, res) {
  // @fixme Do not include deleted posts in search
  if (req.query.q) {
    Post
    .search(req.query.q, {}, { sort: { created: -1 }, limit: 100, populate: [{ path: 'creator', fields: 'profile email picture role'} ] },
      function(err, data) {
        var response = {
          title: res.locals.title + " - Search",
          query: req.query.q,
          posts: data.results,
          count: data.totalCount
        };
        // If it's an ajax request, return a json response
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