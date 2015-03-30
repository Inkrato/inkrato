var config = {
  app: require('../config/app'),
  secrets: require('../config/secrets')
};
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: config.secrets.sendgrid.user,
    pass: config.secrets.sendgrid.password
  }
});

/**
 * GET /contact
 * Contact form page.
 */
exports.getContact = function(req, res) {
  res.render('contact', { title: res.locals.title + " - Contact" });
};

/**
 * POST /contact
 * Send a contact form via email
 * @param email
 * @param name
 * @param message
 */
exports.postContact = function(req, res) {
  req.assert('name', 'Please provide your name').notEmpty();
  req.assert('email', 'Invalid email address').isEmail();
  req.assert('message', 'The message body cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });

  if (errors) {
    req.flash('errors', errors);
    return res.render('contact');
  }

  var from = req.body.email;
  var name = req.body.name;
  var body = req.body.message;
  var to = config.app.email;
  var subject = 'Website Contact Form';

  var mailOptions = {
    to: to,
    from: from,
    subject: subject,
    text: body
  };

  transporter.sendMail(mailOptions, function(err) {
    if (err) {
      req.flash('errors', { msg: err.message });
      return res.render('/contact');
    }
    req.flash('success', { msg: 'Message sent successfully!' });
    res.render('contact');
  });
};