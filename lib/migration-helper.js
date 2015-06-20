/**
 * If any steps such as schema changes need to be performed between releases, 
 * they should happen here to allow for seemless upgrades.
 * 
 * - This script is run once at server startup.
 * - It is safe to run it multiple times.
 * - This is not a library - it does not export anything.
 * 
 * @fixme There is no way to revert/downgrade between versions.
 *
 * Once a DB has been upgraded it will not work with an older release of inkrato.
 */

var MongoClient = require('mongodb').MongoClient;

var config = {
  secrets: require('../config/secrets')
};

MongoClient.connect(config.secrets.db, function(err, db) {
  if(err) { return console.log(err); }
  
  // Migrate Post schema from 0.3.14 to 0.4.0
  db.collection('posts').update({}, { $rename: { "title": "summary", "description": "detail" } }, { upsert: true, multi: true });
});