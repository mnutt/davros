var crypto = require('crypto');
var Fs = require('fs');
var Path = require('path');
var Base = require('jsDAV/lib/shared/base');

var jsDAV_iCollection = require('jsDAV/lib/DAV/interfaces/iCollection');

var Etag = (module.exports = Base.extend({
  getETag: function(cb) {
    var self = this;
    Fs.stat(this.path, function(err, stat) {
      if (err) {
        return cb(err);
      }

      var sum = crypto.createHash('md5');

      sum.update(self.path);
      sum.update(':' + stat.length);
      sum.update(':' + stat.mtime.getTime());
      sum.update(':' + stat.mtime.getMilliseconds());

      var etag = '"' + sum.digest('hex') + '"';
      cb(null, etag);
    });
  }
}));

module.exports.tree = null;
