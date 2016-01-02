var jsDAV_ServerPlugin = require("jsdav/lib/DAV/plugin");
var Fs = require('fs');

var jsDAV_OcMtime_Plugin = module.exports = jsDAV_ServerPlugin.extend({
  name: 'oc-mtime',

  initialize: function(handler) {
    this.handler = handler;

    handler.addEventListener("afterWriteContentBeforeHeaders", this.setOcMtime.bind(this));
  },

  setOcMtime: function(e, uri, headers) {
    var rawMtime = this.handler.httpRequest.headers['x-oc-mtime'];
    var mtime = parseInt(rawMtime, 10);
    if(!mtime || mtime <= 0) {
      return e.next();
    }

    this.handler.getNodeForPath(uri, function(err, node) {
      if(err) {
        return e.next();
      }

      Fs.utimes(node.path, mtime, mtime, function(err) {
        if(!err) {
          headers['x-oc-mtime'] = 'accepted';
        }
        console.log(headers);
        e.next();
      });
    });
  }
});
