var mongoose = require('mongoose'),
    Post = require('./Post');

var schema = new mongoose.Schema({
  name: { type: String, unique: true, required: true},
  icon: String,
  description: String,
  path: { type: String, unique: true},
  order: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false }
})

schema.pre('save', function(next) {
  this.path = encodeURI(this.name.toLowerCase().replace(/\//, ''));
  next();
});

module.exports = mongoose.model('Topic', schema);