var Q = require('q'),
    Topic = require('../models/Topic');

var config = {
  app: require('../config/app'),
  secrets: require('../config/secrets')
};

module.exports = function() {
  
  this.getName = function() {
     return config.app.name;
  }

  this.getEmail = function() {
     return config.app.email;
  }
  
  this.options = function() {
    return {
      post: {
        name: config.app.posts.name,
        path: '/'+encodeURI(config.app.posts.path.replace(/\//g, '')),
        icon: config.app.posts.icon,
        voting: {
          enabled: true
        }
      }
    };
  }

  this.loginOptions = function(provider) {
    switch (provider) {
      case "facebook":
        if (config.secrets.facebook.clientID != '')
          return true;
        break;
      case "google":
        if (config.secrets.google.clientID != '')
          return true;
        break;
      case "twitter":
        if (config.secrets.twitter.consumerKey != '')
          return true;
        break;
      case "github":
        if (config.secrets.github.clientID != '')
          return true;
        break;
      case "email":
        if (config.secrets.sendgrid.user != '')
          return true;
        break;
      default:
        return false;
    }
  }
  
  return this;
}();