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
    app = express();

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
  })
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

  // Set default page title based on app name
  res.locals.title = config.app.name;
  
  // Expose site config details to templates
  res.locals.site = config.app;

  // Make user object available in templates.
  res.locals.user = req.user;
  
  // Export selected theme to all templates (so can be used in layout)
  res.locals.theme = req.session.theme;
  
  next();
});
app.use(function(req, res, next) {
  // Remember original destination before login.
  
  // Exceptions for paths we want to ignore
  // e.g. login pages, JavaScript files that make ajax calls
  var path = req.path.split('/')[1];
  if (/auth|login|css|images|logout|theme|signup|js|fonts|favicon/i.test(path))
    return next();

  if (req.path == "/account/password")
    return next();
    
  req.session.returnTo = req.path;
  next();
});

var hour = 3600000;
var day = hour * 24;
var week = day * 7;
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
  theme: require('./routes/theme'),
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
app.post('/theme', routes.theme.postTheme);
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
app.get('/'+config.app.posts, routes.posts.getPosts);
app.get('/'+config.app.posts+'/new', routes.passport.isAuthenticated, routes.posts.getNewPost);
app.post('/'+config.app.posts+'/new', routes.passport.isAuthenticated, routes.posts.postNewPost);
app.get('/'+config.app.posts+'/search', routes.posts.getSearch);
app.get('/'+config.app.posts+'/edit/:id', routes.passport.isAuthenticated, routes.posts.getEditPost);
app.post('/'+config.app.posts+'/edit/:id', routes.passport.isAuthenticated, routes.posts.postEditPost);
app.get('/'+config.app.posts+'/:id/:slug', routes.posts.getPost);
app.get('/'+config.app.posts+'/:id', routes.posts.getPost);

/**
 * OAuth sign-in routes.
 */
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/profile' }), function(req, res) {
  res.redirect(req.session.returnTo || '/profile');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/profile' }), function(req, res) {
  res.redirect(req.session.returnTo || '/profile');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/profile' }), function(req, res) {
  res.redirect(req.session.returnTo || '/profile');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/profile' }), function(req, res) {
  res.redirect(req.session.returnTo || '/profile');
});

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