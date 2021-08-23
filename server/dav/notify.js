var jsDAV_ServerPlugin = require('jsDAV/lib/DAV/plugin');
var apiWs = require('../api-ws');
var path = require('path');

module.exports = jsDAV_ServerPlugin.extend({
  name: 'ws-notify',

  initialize: function (handler) {
    this.handler = handler;

    handler.addEventListener('beforeMethod', this.updateHandler.bind(this));
  },

  notifyMethods: {
    PUT: true,
    COPY: true,
    MOVE: true,
    DELETE: true,
    PROPPATCH: true,
    MKCOL: true,
  },

  updateHandler: function (e, method, uri) {
    if (this.notifyMethods[method]) {
      var directory = path.dirname(uri);
      if (directory == '.') {
        directory = '/';
      }
      apiWs.notify(encodeURI(directory).replace(/#/g, '%23').replace(/\?/g, '%3F'));
    }

    return e.next();
  },
});
