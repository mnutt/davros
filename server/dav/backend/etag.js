var crypto = require('crypto');
var Fs     = require('fs');
var Path   = require('path');
var Base   = require("jsDAV/lib/shared/base");

var jsDAV_iCollection = require("jsDAV/lib/DAV/interfaces/iCollection");

var Etag = module.exports = Base.extend({
  getETag: function(cb) {
    var self = this;
    self.getProperties(['etag'], function(err, props) {
      if(err) {
        return cb(err, null);
      }

      if(props && props['etag']) {
        cb(null, props['etag']);
      } else {
        var path = self.path;

        self.calculateEtag(function(err, etag) {
          if(err) { return cb(err, null); }

          self.updateProperties({etag: etag}, function(err) {
            if(err) { return cb(err, null); }

            self.expireEtagTree(function(err) {
              cb(err, etag);
            });
          });
        });
      }
    });
  },

  calculateEtag: function(cb) {
    var path = this.path;
    if(this.hasFeature(jsDAV_iCollection)) {
      path = Path.join(this.path, this.PROPS_DIR);
    }

    var sum = crypto.createHash('md5');
    sum.setEncoding('hex');

    var stream = Fs.createReadStream(path);

    var callbackCalled = false;

    stream.on('end', function() {
      if(callbackCalled) { return; }

      sum.end();

      callbackCalled = true;
      cb(null, '"' + sum.read() + '"');
    });

    stream.on('error', function() {
      if(callbackCalled) { return; }

      callbackCalled = true;
      cb(null, null);
    });

    stream.pipe(sum);
  },

  // Recursively unset the etag for a node's ancestors. Whenever a node changes,
  // we want its ancestors to recalculate their own etags. However, it would be
  // too much work to do it ourselves so we instead just unset them so we can
  // lazily recalculate when someone else requests them.

  // This function calls itself recursively until it finishes, then calls `cb`
  expireEtagTree(cb) {
    var parent = Path.dirname(this.path);

    // Stop unsetting etags when we get to the root of our data dir
    if(module.exports.tree && !module.exports.tree.insideSandbox(parent)) {
      return cb(null);
    }

    // Reached the root. Doubtful we'll get this far, but we don't want to end
    // up in an infinite loop.
    if(parent === this.path) {
      return cb(null);
    }

    var parentNode = this.new(parent);

    parentNode.updateProperties({etag: null}, function(err) {
      if(err) {
        // this may be a legit error or we may just not have access, either
        // way we're done
        cb(null);
      } else {
        parentNode.expireEtagTree(cb);
      }
    });
  }
});

module.exports.tree = null;
