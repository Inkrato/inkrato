var mongoose = require('mongoose'),
    Site = require('./Site'),
    slug = require('slug');
    
var schema = new mongoose.Schema({
  name: { type: String, unique: true, required: true},
  icon: String,
  description: String,
  slug: { type: String, unique: true },
  order: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false }
});

schema.pre('save', function(next) {
  this.slug = slug(this.name.toLowerCase());
  next();
});

schema.methods.getUrl = function() {
  return '/'+Site.options().post.slug+'/'+this.slug;
};

module.exports = mongoose.model('Forum', schema);