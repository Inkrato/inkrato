/**
 * A schema for user favourites.
 *
 * When a user favourites/follows a post they will be notified if it's updated.
 *
 * Favourites /could/ have been defined as an array of User ID's on a Post object,
 * or as an array of Post ID's on a User object, but it's been declared
 * as a seperate releationship to allow it to be queried more quickly and to
 * avoid increasing the size of either of those objects.
 */
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User', required: true },
  post: { type: ObjectId, ref: 'Post', required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Favourite', schema);