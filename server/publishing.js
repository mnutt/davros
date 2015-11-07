var fs   = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var url  = require('url');

var destination = '/var/www';
var source = path.relative(path.dirname(destination), process.env.STORAGE_PATH || (__dirname + "/../data"));

exports.unpublish = function(req, res, next) {
  fs.unlink(destination, function(err) {
    if(err) { throw(err); }
    res.json({success: true});
  });
};

exports.getInfo = function(req, res, next) {
  fs.stat(destination, function(err, stat) {
    if(stat) {
      var sessionId = req.headers['x-sandstorm-session-id'];
      exec("./sandstorm-integration/bin/getPublicId " + sessionId, function(err, stdout, stderr) {
        if(err) {
          throw(err);
        }

        var lines = stdout.split("\n");
        var publicId = lines[0];
        var autoUrl = lines[2];
        var host = url.parse(autoUrl).hostname;

        var data = {
          publicId: publicId,
          autoUrl: autoUrl,
          host: host
        };

        res.json(data);
      });
    } else {
      res.json({});
    }
  });
};

exports.publish = function(req, res, next) {
  fs.unlink(destination, function(err) {
    fs.symlink(source, destination, function(err) {
      if(err) {
        throw(err);
      }

      exports.getInfo(req, res, next);
    });
  });
};
