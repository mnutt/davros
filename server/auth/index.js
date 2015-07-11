var sqlite3 = require('sqlite3').verbose();

var init = require('./init');

exports.setup = function(cb) {
  exports.db = new sqlite3.Database(':memory:');
  init(exports.db);
  cb(exports.db);
};

exports.backend = function(db) {

};
