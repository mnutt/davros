var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var Cache = require('./cache');

var cachedFree = new Cache();
var cachedUsed = new Cache();
var cachedResolver = new Cache();

module.exports = function(p, cb) {
  var start = new Date();

  resolve(p, function(err, resolvedPath) {
    if(err) {
      return cb(err, null);
    }

    df(resolvedPath, function(err, free) {
      du(resolvedPath, function(err, used) {
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

function resolve(p, cb) {
  var cachedValue = cachedResolver.get(p);
  if(cachedValue) {
    return cb(null, cachedValue);
  }

  fs.realpath(path.resolve(p), function(err, resolvedPath) {
    if(err) {
      cb(err, resolvedPath);
    } else {
      cachedResolver.set(p, resolvedPath, 60000);
      cb(err, resolvedPath);
    }
  });
}

function df(p, cb) {
  var cachedValue = cachedFree.get('all');
  if(cachedValue) {
    return cb(null, cachedValue);
  }

  exec("df -k '" + p + "' | tail -n 1 | awk '{ print $2\":\"$4 }'", function(err, stdout, stderr) {
    if(err) {
      return cb(err, null);
    }

    var match = stdout.match(/^(\d+):(\d+)/);
    if(!match) {
      return cb("Failed to fetch disk free space", null);
    }

    var free = parseInt(match[2], 10) || 0;
    cachedFree.set('all', free, 1000);

    cb(null, free);
  });
};

function du(p, cb) {
  var cachedValue = cachedUsed.get(p);
  if(typeof(cachedValue) !== "undefined") {
    return cb(null, cachedValue);
  }

  exec("du -k -d 0 '" + p + "'", function(err, stdout, stderr) {
    if(err) {
      return cb(err, null);
    }

    var match = stdout.match(/^(\d+)/);
    if(!match) {
      return cb("Failed to fetch used disk space", null);
    }

    var used = parseInt(match[1], 10) || 0;
    cachedUsed.set(p, used, 1000);

    cb(null, used);
  });
};
