var Post = require('../../models/Post');

/**
 * GET /posts/search
 */
exports.getSearch = function(req, res) {
  if (req.query.q) {
    Post
    .search(req.query.q, {},
      { sort: { created: -1 },
        limit: 100,
        conditions: { deleted: false },
        populate: [ { path: 'creator', fields: 'profile email picture role'},
                    { path: 'comments', fields: 'creator' },
                    { path: 'forum', fields: 'name icon slug'},
                    { path: 'topic', fields: 'name icon slug'},
                    { path: 'state', fields: 'name open'},
                    { path: 'priority', fields: 'name color'}
                  ]
      },
      function(err, data) {
        var response =  {
          query: req.query.q,
          posts: [],
          count: 0
        };

        // Endsures if there is an error because there are no posts yet that
        // it doesn't fail (and instead just returns no results).
        if (!err) {
          response.posts = data.results;
          response.count = data.totalCount;
        }
        
        // If it's an API requst, return the JSON
        if (req.api)
          return res.json(response);
        
        // If it's an ajax request, return a json response with a URL added
        // The URL is used by the typeahead search field to suggest results
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
          response.title = "Search";
          response.topic = null;
          return res.render('posts/search', response);
       }
      });
  } else {
    var response = {
      query: '',
      posts: [],
      count: 0
    };
    if (req.xhr || req.api) {
      return res.json(response);
    } else {
      response.title = "Search";
      response.topic = null;
      return res.render('posts/search', response);
    }
  }
};