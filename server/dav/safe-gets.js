var jsDAV_ServerPlugin = require("jsdav/lib/DAV/plugin");

var jsDAV_SafeGets_Plugin = module.exports = jsDAV_ServerPlugin.extend({
  name: "safe-gets",

  initialize: function(handler) {
    this.handler = handler;

    handler.addEventListener("beforeMethod", this.getHandler.bind(this));
  },

  getHandler: function(e, method, uri) {
    if(method === "GET") {
      this.setContentDisposition(this.handler.httpRequest, this.handler.httpResponse);
    }

    return e.next();
  },

  // HTML files should not be displayed inside davros' UI; download them instead
  setContentDisposition: function(req, res) {
    res.setHeader('Content-Disposition', 'attachment; filename=');
  }
});
