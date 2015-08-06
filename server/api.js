var JSONAPISerializer = require('jsonapi-serializer');
var path = require('path');
var fs = require('fs');
var dirStat = require('dirStat').dirStat;
var url = require('url');

module.exports = function(root) {
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
        res.writeHead(500, {});
        res.send(JSON.stringify(err));
        return;
      }
      console.log(stat);

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
            attributes: ['path', 'files', 'name', 'size', 'mode', 'ctime', 'atime'],
            files: {
              ref: function(collection, field) {
                return field.path;
              },
              attributes: ['size', 'ctime', 'path', 'atime', 'mode', 'name']
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
          attributes: ['size', 'ctime', 'path', 'atime', 'mode', 'name', 'is_directory']
        }).then(function(file) {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(file, null, 2));
        });
      }
    });

  };
};
