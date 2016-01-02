var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

module.exports = function(p, cb) {
  fs.realpath(path.resolve(p), function(err, resolvedPath) {
    if(err) {
      return cb(err, null);
    }

    exec("df -k '" + resolvedPath + "' | tail -n 1 | awk '{ print $2\":\"$4 }'", function(err, stdout, stderr) {
      if(err) {
        return cb(err, null);
      }

      var match = stdout.match(/^(\d+):(\d+)/);
      if(!match) {
        return cb("Failed to fetch disk free space", null);
      }

      var total = parseInt(match[1], 10) || 1;
      var free = parseInt(match[2], 10) || 0;

      exec("du -k -d 0 '" + resolvedPath + "'", function(err, stdout, stderr) {
        if(err) {
          return cb(err, null);
        }

        var match = stdout.match(/^(\d+)/);
        if(!match) {
          return cb("Failed to fetch used disk space", null);
        }

        var used = parseInt(match[1], 10) || 0;

        return cb(null, {
          bsize: 1, // we specifically set the block size to 1k with `-k` above
          frsize: 1, // doesn't really matter for our purposes
          bfree: 0, // no idea what this is for
          bavail: free * 1024, // how much available for unprivileged users, assume we get it
          blocks: used * 1024, // total fs size
          files: 0, // we don't support # of inodes at this time
          ffree: 0 // nor this
        });
      });
    });
  });
};
