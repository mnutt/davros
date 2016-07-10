var jsDAV_ServerPlugin = require("jsDAV/lib/DAV/plugin");

var jsDAV_Mtime_Plugin = module.exports = jsDAV_ServerPlugin.extend({
  name: "mtime",

  initialize: function(handler) {
    this.handler = handler;

    handler.addEventListener("afterWriteContentBeforeHeaders", this.putHandler.bind(this));
  },

  putHandler: function(e, uri, outgoingHeaders) {
    var incomingHeaders = this.handler.httpRequest.headers;
    if(incomingHeaders && incomingHeaders['x-oc-mtime']) {
      outgoingHeaders['X-OC-MTime'] = 'accepted';
    }

    return e.next();
  }
});