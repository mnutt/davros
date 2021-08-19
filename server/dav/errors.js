var jsDAV_ServerPlugin = require('jsDAV/lib/DAV/plugin');

var jsDAV_SafeGets_Plugin = (module.exports = jsDAV_ServerPlugin.extend({
  name: 'log-errors',

  safeTypes: {
    'application/pdf': true
  },

  initialize: function(handler) {
    this.handler = handler;

    handler.addEventListener('error', this.errorHandler.bind(this));
  },

  errorHandler: function(e, error) {
    console.error(error.message);

    return e.next();
  },
}));
