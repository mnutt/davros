var jsDAV_ServerPlugin = require("jsdav/lib/DAV/plugin");
var apiWs = require('./api-ws');
var path = require('path');

var jsDAV_Notify_Plugin = module.exports = jsDAV_ServerPlugin.extend({
  name: "ws-notify",

  initialize: function(handler) {
    this.handler = handler;

    handler.addEventListener("beforeMethod", this.updateHandler.bind(this));
  },

  notifyMethods: {
    PUT: true,
    COPY: true,
    MOVE: true,
    DELETE: true,
    PROPPATCH: true
  },

  updateHandler: function(e, method, uri) {
    if(this.notifyMethods[method]) {
      var directory = path.dirname(uri);
      if(directory == '.') { directory = '/'; }
      apiWs.notify(directory);
    }

    return e.next();
  }
});
