'use strict';

var Fs = require('fs');
var sizeOf = require('image-size');

var jsDAV_FSExt_File = require('jsDAV/lib/DAV/backends/fsext/file');
var Etag = require('./etag');
var PropHandlers = require('./prop-handlers');

module.exports = jsDAV_FSExt_File.extend(Etag, PropHandlers, {
  propHandlers: {
    "{DAV:}getdimensions": function(prop, next) {
      sizeOf(this.path, (err, dimensions) => {
        if (err) {
          next();
        } else {
          next(null, JSON.stringify([dimensions.width, dimensions.height]));
        }
      });
    },
    "{http://owncloud.org/ns}id": function(prop, next) {
      return Fs.stat(this.path, function(err, stat) {
        if (err || !stat) {
          next()
        } else {
          next(null, "" + stat.ino);
        }
      });
    },

    // https://github.com/owncloud/client/blob/970331c531490f7aadbd262c87b09363a3d5cf2a/docs/modules/ROOT/pages/architecture.adoc
    "{http://owncloud.org/ns}permissions": function(prop, next) {
      next(null, "WDNV");
    }
  },
  getProperties: function(requestedProperties, cbgetprops) {
    var self = this;
    this.getHandlerProperties(requestedProperties, function(err, values) {
      if(err) {
        cbgetprops(err);
      } else {
        jsDAV_FSExt_File.getProperties.call(self, requestedProperties, function (err, properties) {
          cbgetprops(err, Object.assign({}, values, properties));
        });
      }
    });
  },
});
