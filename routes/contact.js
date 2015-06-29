var nodemailer = require("nodemailer"),
    Site = require('../models/Site');

var config = {
  app: require('../config/app'),
  secrets: require('../config/secrets')
};

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = function(req, res) {
  res.render('contact', { title: "Contact", confirmation: false });
};

/**
 * POST /contact
 * Send a contact form via email
 * @param email
 * @param name
 * @param message
 */
exports.postContact = function(req, res) {
  req.assert('name', 'Please tell us your name').notEmpty();
  req.assert('email', 'Email address invalid').isEmail();
  req.assert('message', 'Message body is blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });

  if (errors) {
    req.flash('errors', errors);
    return res.render('contact', { title: "Contact", confirmation: false });
  }

  var from = req.body.email;
  var body = req.body.message;
  var to = config.app.email;
  var subject = 'Contact Form - '+req.headers.host;

  var mailOptions = {
    to: to,
    from: from,
    subject: subject,
    text: body+"\n\n-- \n"+req.body.name+"\n"+req.body.email
  };

  var transporter = nodemailer.createTransport(Site.getMailTransport());
  transporter.sendMail(mailOptions, function(err) { });
  res.render('contact', { title: "Contact", confirmation: true });
};