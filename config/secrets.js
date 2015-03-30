/**
 * IMPORTANT!
 *
 * You should never commit this file to a public repository on GitHub.
 *
 * If you have already commited this file to GitHub with your keys, then
 * refer to https://help.github.com/articles/remove-sensitive-data
*/

module.exports = {

  // Reset the DB on the command line with: 
  // > mongo inkrato --eval "db.dropDatabase()"
  db: process.env.MONGODB || 'mongodb://localhost:27017/inkrato',

  sessionSecret: process.env.SESSION_SECRET || '526aa78cdeedf412fd27fedb5ab5ecf8',

  sendgrid: {
    enabled: process.env.SENDGRID_ENDABLED || false,
    user: process.env.SENDGRID_USER || '',
    password: process.env.SENDGRID_PASSWORD || ''
  },

  facebook: {
    enabled: process.env.FACEBOOK_ENABLED || false,
    clientID: process.env.FACEBOOK_ID || '',
    clientSecret: process.env.FACEBOOK_SECRET || '',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: process.env.SENDGRID_USER ||true
  },

  github: {
    enabled: process.env.GITHUB_ENABLED || false,
    clientID: process.env.GITHUB_ID || '',
    clientSecret: process.env.GITHUB_SECRET || '',
    callbackURL: '/auth/github/callback',
    passReqToCallback: true
  },

  twitter: {
    enabled: process.env.TWITTER_ENABLED || false,
    consumerKey: process.env.TWITTER_KEY || '',
    consumerSecret: process.env.TWITTER_SECRET  || '',
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },

  google: {
    enabled: process.env.GOOGLE_EANBLED || false,
    clientID: process.env.GOOGLE_ID || '',
    clientSecret: process.env.GOOGLE_SECRET || '',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  }
  
};
