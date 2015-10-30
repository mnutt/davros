"use strict";

var Fs = require("fs");

var jsDAV_FSExt_File = require("jsDAV/lib/DAV/backends/fsext/file");
var jsDAV_FS_Node = require("jsDAV/lib/DAV/backends/fs/node");
var Util = require("jsDAV/lib/shared/util");

var Etag = require("./etag");

module.exports = jsDAV_FSExt_File.extend(jsDAV_FS_Node, {
  getETag: function(cbfsgetetag) {
    Etag(this.path, cbfsgetetag);
  }
});
