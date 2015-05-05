var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: { type: String, unique: true, required: true},
  color: { type: String, required: true},
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('Label', schema);