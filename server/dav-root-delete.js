var Fs = require('fs');

var jsDAV_ServerPlugin = require("jsdav/lib/DAV/plugin");
var Util               = require("jsdav/lib/shared/util");

var jsDAV_Notify_Plugin = module.exports = jsDAV_ServerPlugin.extend({
  name: "root-delete",

  initialize: function(handler) {
    this.handler = handler;

    handler.addEventListener("afterDelete", this.deleteHandler.bind(this));
  },

  deleteHandler: function(e, uri) {
    if(uri === "") {
      var rootPath = this.handler.server.tree.getRealPath(uri);
      Util.log("Root path was deleted; recreating.");
      Fs.mkdir(rootPath, "0755", function(err) {
        e.next();
      });
    } else {
      e.next();
    }
  }
});
