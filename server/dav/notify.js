var jsDAV_ServerPlugin = require('jsDAV/lib/DAV/plugin');
var apiWs = require('../api-ws');
var path = require('path');

module.exports = jsDAV_ServerPlugin.extend({
  name: 'ws-notify',

  initialize: function (handler) {
    this.handler = handler;
    this.moveSourceDirectory = null;

    // Notify after writes/binds complete so clients don't reload too early.
    handler.addEventListener('afterWriteContent', this.afterWriteContent.bind(this));
    handler.addEventListener('afterBind', this.afterBind.bind(this));
    handler.addEventListener('afterDelete', this.afterDelete.bind(this));
    handler.addEventListener('afterCopy', this.afterCopy.bind(this));
    handler.addEventListener('afterMove', this.afterMove.bind(this));

    // Track source directory for MOVE so both source and destination refresh.
    handler.addEventListener('beforeUnbind', this.beforeUnbind.bind(this));
  },

  notifyDirectory: function (uri, alternateUri) {
    var target = typeof uri === 'string' ? uri : alternateUri;
    if (typeof target !== 'string') {
      return;
    }

    var directory = path.dirname(target);
    if (directory === '.') {
      directory = '/';
    }
    apiWs.notify(directory);
  },

  beforeUnbind: function (e, uri) {
    if (this.handler.httpRequest.method === 'MOVE' && typeof uri === 'string') {
      this.moveSourceDirectory = path.dirname(uri);
    }
    return e.next();
  },

  afterWriteContent: function (e, uri) {
    this.notifyDirectory(uri);
    return e.next();
  },

  afterBind: function (e, uri, alternateUri) {
    this.notifyDirectory(uri, alternateUri);
    return e.next();
  },

  afterDelete: function (e, uri) {
    this.notifyDirectory(uri);
    return e.next();
  },

  afterCopy: function (e, uri, alternateUri) {
    this.notifyDirectory(uri, alternateUri);
    return e.next();
  },

  afterMove: function (e, uri, alternateUri) {
    if (this.moveSourceDirectory && this.moveSourceDirectory !== '.') {
      apiWs.notify(this.moveSourceDirectory);
    } else if (this.moveSourceDirectory === '.') {
      apiWs.notify('/');
    }

    this.notifyDirectory(uri, alternateUri);
    this.moveSourceDirectory = null;
    return e.next();
  },
});
