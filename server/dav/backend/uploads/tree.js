'use strict';

const Fs = require('fs');
const jsDAV_FSExt_Tree = require('jsDAV/lib/DAV/backends/fsext/tree');
const jsDAV_FSExt_Directory = require('jsDAV/lib/DAV/backends/fsext/directory');
const jsDAV_FSExt_File = require('jsDAV/lib/DAV/backends/fsext/file');
const File = require('../file');
const Directory = require('./directory');
const Util = require('jsDAV/lib/shared/util');
const Exc = require('jsDAV/lib/shared/exceptions');

const Tree = (module.exports = jsDAV_FSExt_Tree.extend({
  /**
   * Returns a new node for the given path
   *
   * @param {String} path
   * @return void
   */
  getNodeForPath: function(path, cbfstree) {
    const realPath = this.getRealPath(path);
    const nicePath = this.stripSandbox(realPath);

    if (path.startsWith('dav')) {
      // we might be trying to move out of this tree and into the /dav tree, allow it through
      const trimmedPath = path.slice('dav'.length).replace(/^\//, '');
      const trimmedRealPath = this.fileTree.getRealPath(trimmedPath);

      // Check that destination is a place we are allowed to put a file
      if (!this.fileTree.insideSandbox(trimmedRealPath)) {
        return cbfstree(new Exc.Forbidden('You are not allowed to access ' + nicePath));
      }

      return this.fileTree.getNodeForPath(trimmedPath, cbfstree);
    }

    if (!this.insideSandbox(realPath))
      return cbfstree(new Exc.Forbidden('You are not allowed to access ' + nicePath));

    Fs.stat(realPath, function(err, stat) {
      if (!Util.empty(err))
        return cbfstree(new Exc.FileNotFound('File at location ' + nicePath + ' not found'));

      cbfstree(null, stat.isDirectory() ? Directory.new(realPath) : File.new(realPath));
    });
  },

  /**
   * Moves a completed upload from .file to its real location
   *
   * This is tricky because the source is in the uploadsTree while the destination is
   * in the regular tree. We have to fake out
   */
  move: async function(source, destination, cbfsmove) {
    source      = this.getRealPath(source);
    destination = this.fileTree.getRealPath(destination.replace(/^dav\//, ''));

    if (!this.fileTree.insideSandbox(destination)) {
      return cbfsmove(new Exc.Forbidden("You are not allowed to move to " +
                                        this.fileTree.stripSandbox(destination)));
    }

    Fs.stat(source, function(err, stat) {
      if (!Util.empty(err))
        return cbfsmove(new Exc.FileNotFound("File at location " + source + " not found"));

      var isDir = stat.isDirectory();
      var node = isDir
          ? jsDAV_FSExt_Directory.new(source)
          : jsDAV_FSExt_File.new(source);
      node.getResourceData(function(err, data) {
        if (err)
          return cbfsmove(err, source, destination);

        Fs.rename(source, destination, function(err) {
          if (err)
            return cbfsmove(err, source, destination);

          node = isDir
            ? jsDAV_FSExt_Directory.new(destination)
            : jsDAV_FSExt_File.new(destination);
          node.putResourceData(data, function(err) {
            cbfsmove(err, source, destination);
          });
        });
      });
    });
  }
}));
