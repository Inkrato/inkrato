/**
 * An object for representing User notifications (messages) 
 * 
 * Types:
 *   ALERT: A high priority system message requiring user action
 *   INFO: (default): A general purpose informational message, low priority
 *   POST: Used notify of an update to a post the user is tracking
 *   COMMENT: Used to notify of a new comment to or moderation on their comments
 *   MENTION: Notification a user has been mentioned in a post or comment
 *   PRIVATE: A direct message sent by another user
 * 
 * The post & comment fields are populated if a notification refers to an update
 * on a post and/or comment so a link to them can be generated.
 * 
 * The 'sent' field is only populated once an emali 
 */
var mongoose = require('mongoose'),
               Site = require('./Site'),
               User = require('./User');
               //nodemailer = require('nodemailer');

var schema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  subject: String,
  message: String,
  type: { type: String, enum: ['ALERT', 'INFO', 'POST', 'COMMENT', 'MENTION', 'PRIVATE'], default: 'INFO' },
  post: { type: mongoose.Schema.ObjectId, ref: 'Post' },
  comment: { type: mongoose.Schema.ObjectId, ref: 'Comment' },
  date: { type: Date, default: Date.now }, // Date created
  sent: { type: Date, default: null }, // Date emailed (if feature enabled)
  read: { type: Date, default: null } // Date marked as read (null if unread)
});

schema.pre('save', function(next) {
  // Instead of doing this this...
  //
  // Considering attaching an event to look for pending notifications and pick 
  // them up and send a single batch of emails for each user.
  //
  // This would reduce email spam for end users and make it easy to combine
  // multiple emails that might otherwise be triggered (e.g. mentions on posts 
  // a user is already following).
  
  /*
  if (this.isNew) {
    // @TODO If the user has a verified email address and email notifications
    // are enabled then also send them an email.
    User
    .findOne({ _id: this.user })
    .exec(function(err, user) {
      if (err || !user) next();
      
      // Don't email if user is not verified, or if they have opted out
      if (user.verified == false || user.emailNotifications == false) next();

      // Send an email with the notification
      // @TODO Wrap message in HTML template
      var transporter = nodemailer.createTransport(Site.getMailTransport());
      var mailOptions = {
        to: user.email,
        from: Site.getEmail(),
        subject: this.subject,
        text: this.message
      };
      transporter.sendMail(mailOptions, function(err) {
        // @TODO log email sending errors
      });
            
      // Don't wait for email before sending confirmation
      next();
    });
  }
  */  
});

module.exports = mongoose.model('Notification', schema);