var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: { type: String, unique: true, required: true},
  order: { type: Number, default: 0 },
  open: { type: Boolean, default: true }
});

module.exports = mongoose.model('State', schema);