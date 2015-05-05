var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: { type: String, unique: true, required: true},
  color: { type: String, required: true},
  order: { type: Number, default: 0 }
})

schema.pre('save', function(next) {
  this.path = encodeURI(this.name.toLowerCase().replace(/\//, ''));
  next();
});

module.exports = mongoose.model('Label', schema);