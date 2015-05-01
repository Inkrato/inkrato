/**
 * Module dependencies.
 */

var express = require('express'),
    cookieParser = require('cookie-parser'),
    compress = require('compression'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    csrf = require('lusca').csrf(),
    methodOverride = require('method-override'),
    _ = require('lodash'),
    MongoStore = require('connect-mongo')({ session: session }),
    flash = require('express-flash'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    expressValidator = require('express-validator'),
    connectAssets = require('connect-assets'),
    ejs = require('ejs'),
    partials = require('express-partials'),
    i18n = require("i18n"),
    Site = require('./models/Site'),
    Topic = require('./models/Topic'),
    linkify = require("html-linkify"),
    app = express();

var hour = 3600000,
    day = hour * 24,
    week = day * 7;

/**
 * App configuration settings
 */
var config = {
  app: require('./config/app'),
  secrets: require('./config/secrets')
};

/**
 * Connect to MongoDB.
 */
mongoose.connect(config.secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});


// On startup, create a topic in the DB if that topic doesn't exist already
var topics = [];
config.app.posts.topics.forEach(function(topic, index) {
  Topic
  .findOne({ name: topic.name })
  .exec(function (err, topicInDatabase) {
    if (topicInDatabase) {
      // If the topic exists aready, update it's properties
      topicInDatabase.name = topic.name;
      topicInDatabase.icon = topic.icon;
      topicInDatabase.description = topic.description;
      topicInDatabase.order = index;
      topicInDatabase.deleted = false;
      topicInDatabase.save(function(err) {
        if (err)
          console.log('Unable to update topic in DB: '+topic.name);
      });
    } else {
      // If the topic doesn't exist, create it
      new Topic({
        name: topic.name,
        icon: topic.icon,
        description: topic.description,
        order: index
      }).save(function(err) {
        if (err)
          console.log('Unable to create new topic in DB: '+topic.name);
      });
    }
  });
});

// Loop throough all topics in the database, if a config is NOT also in the config then mark it as deleted (will be hidden, but only marked as deleted so that it can still be re-enabled later)
var topics = [];
Topic
.find({ deleted: false }, null, { sort : { order: 1 } })
.exec(function (err, topicsInDatabase) {
  topicsInDatabase.forEach(function(topicInDatabase) {
    var topicFoundInConfig = false;
    config.app.posts.topics.forEach(function(topicInConfig) {
      if (topicInConfig.name == topicInDatabase.name) {
        topicFoundInConfig = true;
        topics.push(topicInDatabase);
      }
    });
    if (topicFoundInConfig === false) {
      topicInDatabase.deleted = true;
      topicInDatabase.save(function(err) {
        if (err)
          console.log('Unable to mark topic in DB as deleted: '+topicInDatabase.name);
      });
    }
  });
});

/**
 * CSRF whitelist.
 */
var csrfExclude = [];

// i18n configuration
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'de'],
    defaultLocale: 'de',

    // set cookie name to parse locale settings from
    cookie: 'lang',

    // where to find json files
    directory: __dirname + '/locales',

    // whether to write new locale information to disk - defaults to true
    updateFiles: false,

    // what to use as the indentation unit - defaults to "\t"
    indent: "\t",
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejs.__express);
partials.register('.ejs', ejs);
app.use(partials());
app.use(compress());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')],
  helperContext: app.locals
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secrets.sessionSecret,
  store: new MongoStore({
    url: config.secrets.db,
    auto_reconnect: true
  }),
  cookie: {
    maxAge: 4 * week
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  // CSRF protection.
  if (_.contains(csrfExclude, req.path)) return next();
  csrf(req, res, next);
});
app.use(function(req, res, next) {

  // Set default page title based on configured site name
  res.locals.title = Site.getName();

  // Expose site config object to all templates
  res.locals.site = Site;

  // Make user object available in all templates
  res.locals.user = req.user;

  // Expose path to views
  res.locals.path = req.path;
  
  // Expose linkify (to escape content while making hyperliks work) to all views
  res.locals.linkify = linkify;
  
  res.locals.topics = topics;

  next();
});
app.use(function(req, res, next) {
  // Remember original destination before login.
  
  // Exceptions for paths we want to ignore
  // e.g. login pages, JavaScript files that make ajax calls
  var path = req.path.split('/')[1];
  if (/auth|login|css|images|logout|signup|js|fonts|favicon/i.test(path))
    return next();

  // Never return user to the account password reset page
  if (req.path == "/account/password")
    return next();
  
  // Never return the user to the vote forms (they are POST only)
  if (new RegExp('^' + '\/'+Site.options().post.path+'\/(upvote|downvote|unvote)\/').test(req.path))
    return next();
    
  req.session.returnTo = req.path;
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: week * 4 }));

/**
 * Route handlers
 */
var routes = {
  passport: require('./routes/passport'),
  user: require('./routes/user'),
  home: require('./routes/home'),
  about: require('./routes/about'),
  contact : require('./routes/contact'),
  posts: require('./routes/posts')
};

app.use(function(req, res, next) {
  // Open up calls to cross site origin requests
  // res.setHeader("Access-Control-Allow-Origin", "*");
  // Specify which headers and methods can be set by the client
  // Explicitly required for compatiblity with many browser based REST clients
  // res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,Session-Id,Api-Key");
  // res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS,PUT,DELETE");
  
  if (req.method == "OPTIONS") {
      // Return immediately for all OPTIONS requests
      res.send();
  } else {
      next();    
  }
});

/**
 * Main routes.
 */
app.get('/', routes.home.index);
app.get('/about', routes.about.getAbout);
app.get('/login', routes.user.getLogin);
app.post('/login', routes.user.postLogin);
app.get('/logout', routes.user.logout);
app.get('/reset-password', routes.user.getResetPassword);
app.post('/reset-password', routes.user.postResetPassword);
app.get('/change-password/:token', routes.user.getChangePassword);
app.post('/change-password/:token', routes.user.postChangePassword);
app.get('/signup', routes.user.getSignup);
app.post('/signup', routes.user.postSignup);
app.get('/contact', routes.contact.getContact);
app.post('/contact', routes.contact.postContact);
app.get('/profile', routes.passport.isAuthenticated, routes.user.getAccount);
app.get('/account', routes.passport.isAuthenticated, routes.user.getAccount);
app.get('/account/profile', routes.passport.isAuthenticated, routes.user.getAccount);
app.post('/account/profile', routes.passport.isAuthenticated, routes.user.postUpdateProfile);
app.post('/account/password', routes.passport.isAuthenticated, routes.user.postUpdatePassword);
app.post('/account/delete', routes.passport.isAuthenticated, routes.user.postDeleteAccount);
app.get('/account/unlink/:provider', routes.passport.isAuthenticated, routes.user.getOauthUnlink);
app.get('/new', routes.passport.isAuthenticated, routes.posts.getNewPost);
app.post('/new', routes.passport.isAuthenticated, routes.posts.postNewPost);
app.get('/search', routes.posts.search.getSearch);
app.get(Site.options().post.path, routes.posts.getTopics);
app.get(Site.options().post.path+'/:topic', routes.posts.getPosts);
app.get(Site.options().post.path+'/:topic/new', routes.passport.isAuthenticated, routes.posts.getNewPost);
app.post(Site.options().post.path+'/:topic/new', routes.passport.isAuthenticated, routes.posts.postNewPost);
app.get(Site.options().post.path+'/:topic/edit/:id', routes.passport.isAuthenticated, routes.posts.getEditPost);
app.post(Site.options().post.path+'/:topic/edit/:id', routes.passport.isAuthenticated, routes.posts.postEditPost);
// These routes come after other topic routes to work correctly
app.get(Site.options().post.path+'/:topic/:id/:slug', routes.posts.getPost);
app.get(Site.options().post.path+'/:topic/:id', routes.posts.getPost);
if (Site.options().post.voting.enabled == true) {
  app.post('/upvote/:id', routes.passport.isAuthenticated, routes.posts.postUpvote);
  app.post('/downvote/:id', routes.passport.isAuthenticated, routes.posts.postDownvote);
  app.post('/unvote/:id', routes.passport.isAuthenticated, routes.posts.postUnvote);
}
app.post('/comments/add/:id', routes.passport.isAuthenticated, routes.posts.comments.postAddComment);

/**
 * OAuth sign-in routes.
 */
if (Site.loginOptions('facebook')) {
  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/profile' }), function(req, res) {
    res.redirect(req.session.returnTo || '/profile');
  });
}
if (Site.loginOptions('google')) {
  app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/profile' }), function(req, res) {
    res.redirect(req.session.returnTo || '/profile');
  });
}
if (Site.loginOptions('twitter')) {
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/profile' }), function(req, res) {
    res.redirect(req.session.returnTo || '/profile');
  });
}
if (Site.loginOptions('github')) {
  app.get('/auth/github', passport.authenticate('github'));
  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/profile' }), function(req, res) {
    res.redirect(req.session.returnTo || '/profile');
  });
}

/**
 * 500 Error Handler.
 */
app.use(function (err, req, res, next) {
  // treat as 404
  if (err.message
    && (~err.message.indexOf('not found')
    || (~err.message.indexOf('Cast to ObjectId failed')))) {
    return next();
  }
  console.error(err.stack);
  res.status(500).render('500', { error: err.stack });
});

/**
 * 404 File Not Found Handler.
 */
app.use(function (req, res, next) {
  res.status(404).render('404', { url: req.originalUrl });
});
  

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;