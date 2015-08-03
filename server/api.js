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

    dirStat(fullPath, function(err, files) {
      if(err) {
        res.writeHead(500, {});
        res.end(JSON.stringify(err));
        return;
      }

      files.forEach(function(file) {
        file.path = relative(file.filePath);
      });

      var data = {
        path: relativePath.slice(1),
        files: files
      };

      JSONAPISerializer('file', data, {
        topLevelLinks: { self: 'http://localhost:4214/api/files' },
        id: 'path',
        attributes: ['path', 'files'],
        files: {
          ref: function(collection, field) {
            return field.path;
          },
          attributes: ['size', 'ctime', 'path', 'atime', 'mode']
        }
      }).then(function(files) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(files, null, 2));
      });
    });
  };
};
