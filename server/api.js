var JSONAPISerializer = require('jsonapi-serializer');
var path              = require('path');
var fs                = require('fs');
var dirStat           = require('dirStat').dirStat;
var url               = require('url');
var multiparty        = require('multiparty');
var mkdirp            = require('mkdirp');
var async             = require('async');
var apiWs             = require('./api-ws');

exports.upload = function(root) {
  return function(req, res, next) {
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
      files = files.file;

      // Files and fields are separated for some reason; zip them together
      files.forEach(function(file, i) {
        file.uploadLocation = fields.location[i];
        file.relativePath = fields.relativePath[i];
      });

      async.forEach(files, function(file, callback) {
        var uploadDirectory = [root, file.uploadLocation].join('/');
        var relativeDirectory = path.dirname(file.relativePath).replace(/^\//, '');
        var relativeUpload = path.resolve(uploadDirectory,
                                          relativeDirectory);

        if(relativeUpload.indexOf(root) < 0) {
          callback("Invalid path");
          return;
        }

        mkdirp(relativeUpload, function(err) {
          if(err) {
            callback(err);
          } else {
            var newFile = [relativeUpload, file.originalFilename].join('/');
            fs.rename(file.path, newFile, function(err) {
              var locationUpdate = file.uploadLocation;
              if(locationUpdate === "") { locationUpdate = "/"; }
              apiWs.notify(locationUpdate);
              callback(err);
            });
          }
        });
      }, function(err) {
        if(err) {
          res.writeHead(500, {});
          res.end(err.message);
        } else {
          res.writeHead(200, {});
          res.end('ok');
        }
      });
    });
  };
};

var jsonAttrs = ["ctime", "mode", "mtime", "name", "path", "size"];

exports.files = function(root) {
  // All paths should look relative, to help ember out. So
  // the root path should include a trailing slash
  root += "/";

  function relative(fullPath, rootPath) {
    if(!rootPath) { rootPath = root; }
    return fullPath.slice(rootPath.length);
  }

  return function(req, res, next) {
    var relativePath = decodeURIComponent(req.url);

    var fullPath = path.normalize(path.join(root, relativePath));
    if(fullPath.indexOf(root) != 0) {
      return next();
    }

    fs.stat(fullPath, function(err, stat) {
      if(err) {
        var code = (err.errno === -2) ? 404 : 500;
        res.writeHead(code, {});
        res.end(JSON.stringify(err));
        return;
      }

      if(req.method === "DELETE") {
        fs.unlink(fullPath, function(err) {
          if (err) { throw(err); }
          res.writeHead(204, {});
          res.end();

          apiWs.notify(path.dirname(relativePath));
        });
        return;
      }

      var data = stat;
      data.path = relativePath.slice(1);
      data.name = path.basename(relativePath);

      if(stat.isDirectory()) {
        dirStat(fullPath, function(err, files) {
          if(err) {
            res.writeHead(500, {});
            res.end(JSON.stringify(err));
            return;
          }

          files.forEach(function(file) {
            file.path = relative(file.filePath);
            file.name = path.basename(file.filePath);
          });

          data.files = files;

          JSONAPISerializer('file', data, {
            topLevelLinks: { self: 'http://localhost:4214/api/files' },
            id: 'path',
            attributes: jsonAttrs.concat("files"),
            files: {
              ref: function(collection, field) {
                return field.path;
              },
              attributes: jsonAttrs
            }
          }).then(function(files) {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(files, null, 2));
          });
        });
      } else {
        var data = stat;

        JSONAPISerializer('file', data, {
          topLevelLinks: { self: 'http://localhost:4214/api/files' },
          id: 'path',
          attributes: jsonAttrs
        }).then(function(file) {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(file, null, 2));
        });
      }
    });

  };
};
