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
    user: process.env.SENDGRID_USER || '',
    password: process.env.SENDGRID_PASSWORD || ''
  },

  facebook: {
    clientID: process.env.FACEBOOK_ID || '',
    clientSecret: process.env.FACEBOOK_SECRET || '',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: process.env.SENDGRID_USER || ''
  },

  github: {
    clientID: process.env.GITHUB_ID || '',
    clientSecret: process.env.GITHUB_SECRET || '',
    callbackURL: '/auth/github/callback',
    passReqToCallback: true
  },

  twitter: {
    consumerKey: process.env.TWITTER_KEY || '',
    consumerSecret: process.env.TWITTER_SECRET  || '',
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },

  google: {
    clientID: process.env.GOOGLE_ID || '',
    clientSecret: process.env.GOOGLE_SECRET || '',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  }
  
};
