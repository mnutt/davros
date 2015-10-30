var crypto = require('crypto');
var Fs = require('fs');

module.exports = function(path, cb) {
  Fs.stat(path, function(err, stat) {
    if (err)
      return cb(err, null);

    var sum = crypto.createHash('md5');
    sum.update('' + path + stat.ino + stat.size + stat.mtime);

    cb(err, '"' + sum.digest('hex') + '"');
  });
};
