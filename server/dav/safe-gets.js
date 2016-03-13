var jsDAV_ServerPlugin = require("jsdav/lib/DAV/plugin");
var signature = require("../signature");

var jsDAV_SafeGets_Plugin = module.exports = jsDAV_ServerPlugin.extend({
  name: "safe-gets",

  safeTypes: {
    "application/pdf": true
  },

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

  isSigned: function(req) {
    return req.query.signature && signature.verify(req.query.signature);
  },

  // HTML files should not be displayed inside davros' UI; download them instead
  setContentDisposition: function(req, res) {
    var self = this;
    var original = res.writeHead;

    // signature is writeHead(statusCode[, statusMessage][, headers])
    res.writeHead = function() {
      if(arguments.length === 3) {
        headers = arguments[2];
      } else {
        headers = arguments[1];
      }
      if(!headers) { headers = {}; }

      // this doesn't work in Sandstorm yet but maybe will someday
      headers['content-security-policy'] = "script-src 'self'; img-src 'self'; sandbox allow-forms allow-scripts;";

      // exception for pdf since we want to display it inline
      if(!self.isSigned(req)) {
        headers['content-disposition'] = 'attachment; filename=';
      }

      original.apply(res, arguments);
    };
  }
});
