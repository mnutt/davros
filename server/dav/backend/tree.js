'use strict';

var Fs = require('fs');
var jsDAV_FSExt_Tree = require('jsDAV/lib/DAV/backends/fsext/tree');
var File = require('./file');
var Directory = require('./directory');
var Util = require('jsDAV/lib/shared/util');
var Exc = require('jsDAV/lib/shared/exceptions');

module.exports = jsDAV_FSExt_Tree.extend({
  /**
   * Returns a new node for the given path
   *
   * @param {String} path
   * @return void
   */
  getNodeForPath: function (path, cbfstree) {
    var realPath = this.getRealPath(path);
    var nicePath = this.stripSandbox(realPath);
    if (!this.insideSandbox(realPath))
      return cbfstree(new Exc.Forbidden('You are not allowed to access ' + nicePath));

    Fs.stat(realPath, function (err, stat) {
      if (!Util.empty(err)) {
        return cbfstree(new Exc.FileNotFound('File at location ' + nicePath + ' not found'));
      }

      cbfstree(null, stat.isDirectory() ? Directory.new(realPath) : File.new(realPath));
    });
  },
});
