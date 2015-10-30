"use strict";

var Fs = require("fs");

var jsDAV_FS_Tree = require("jsDAV/lib/DAV/backends/fs/tree");
var jsDAV_Chunked_File = require("./file");
var jsDAV_Chunked_Directory = require("./directory");

var Util = require("jsDAV/lib/shared/util");
var Exc = require("jsDAV/lib/shared/exceptions");

var jsDAV_Chunked_Tree = module.exports = jsDAV_FS_Tree.extend({
  /**
   * Returns a new node for the given path
   *
   * @param {String} path
   * @return void
   */
  getNodeForPath: function(path, cbfstree) {
    var realPath = this.getRealPath(path);
    var nicePath = this.stripSandbox(realPath);
    if (!this.insideSandbox(realPath))
      return cbfstree(new Exc.Forbidden("You are not allowed to access " + nicePath));

    Fs.stat(realPath, function(err, stat) {
      if (!Util.empty(err))
        return cbfstree(new Exc.FileNotFound("File at location " + nicePath + " not found"));

      cbfstree(null, stat.isDirectory()
               ? jsDAV_Chunked_Directory.new(realPath)
               : jsDAV_Chunked_File.new(realPath));
    });
  }
});
