var jsDAV_ServerPlugin = require('jsDAV/lib/DAV/plugin');

module.exports = jsDAV_ServerPlugin.extend({
  name: 'rewrite-url',

  initialize: function (handler) {
    this.handler = handler;

    handler.getBaseUri = function () {
      if (this.httpRequest._baseUri) {
        return this.httpRequest._baseUri;
      } else {
        return this.server.getBaseUri();
      }
    };
  },
});
