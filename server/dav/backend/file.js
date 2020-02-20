'use strict';

var Fs = require('fs');
var sizeOf = require('image-size');

var jsDAV_FSExt_File = require('jsDAV/lib/DAV/backends/fsext/file');
var jsDAV_iProperties = require('jsDAV/lib/DAV/interfaces/iProperties');
var jsDAV_FS_Node = require('jsDAV/lib/DAV/backends/fs/node');
var Util = require('jsDAV/lib/shared/util');
var Etag = require('./etag');

module.exports = jsDAV_FSExt_File.extend(Etag, jsDAV_iProperties, {
  getProperties: function(properties, cbgetprops) {
    sizeOf(this.path, (err, dimensions) => {
      if (err) {
        cbgetprops(err, {});
      } else {
        cbgetprops(null, {
          '{DAV:}getdimensions': JSON.stringify([dimensions.width, dimensions.height])
        });
      }
    });
  },

  updateProperties: function(mutations, cb) {
    cb();
  }
});
