"use strict";

var Fs = require("fs");

var jsDAV_FSExt_File = require("jsDAV/lib/DAV/backends/fsext/file");
var jsDAV_FS_Node    = require("jsDAV/lib/DAV/backends/fs/node");
var Util             = require("jsDAV/lib/shared/util");
var Etag             = require("./etag");
var CachedProperties = require("./cached-properties");

module.exports = jsDAV_FSExt_File.extend(Etag, CachedProperties, {
  setName: function(name, cbfssetname) {
    var self = this;
    this.recalculateEtagTree(function() {
      jsDAV_FSExt_File.setName.call(self, name, cbfssetname);
    });
  },

  delete: function(cbfsfiledelete) {
    var self = this;
    this.recalculateEtagTree(function() {
      jsDAV_FSExt_File['delete'].call(self, cbfsfiledelete);
    });
  }
});
