var Base   = require("jsDAV/lib/shared/base");
var jsDAV_FSExt_Node = require("jsDav/lib/DAV/backends/fsext/node");

var propertyCache = {};

// We assume that we are the only ones to modify the .jsdav resource files.
// If that is the case, we can do some caching of the response, and save ourselves
// some time parsing the same json thousands of times. It helps a lot for very
// large directories.

var CachedProperties = module.exports = Base.extend({
  putResourceData: function(newData, cbputresdata) {
    var path = this.getResourceInfoPath();
    delete propertyCache[path];

    jsDAV_FSExt_Node.putResourceData.call(this, newData, cbputresdata);
  },

  getResourceJson: function(cbgetresjson) {
    var self = this;

    var path = this.getResourceInfoPath();
    if(propertyCache[path]) {
      return cbgetresjson(null, propertyCache[path]);
    }

    jsDAV_FSExt_Node.getResourceJson.call(this, function(err, data) {
      propertyCache[path] = data;

      cbgetresjson(err, data);
    });
  }
});
