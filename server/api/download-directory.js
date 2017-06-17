var fs                = require('fs');
var path              = require('path');

function errorHandler(res) {
  return function(err) {
    res.writeHead(500, {});
    res.end(err.message);
  };
}

module.exports = function(root) {

  // ignore relative or empty path components
  var ignoredComponents = ["",".",".."];

  return function(req, res, next) {
    var relPath = req.query.path;
    var fullPath = root;
    var name = 'home';
    relPath.split('/').forEach(function(part) {
      if (ignoredComponents.indexOf(part) !== -1) {
        return;
      }
      fullPath = path.join(fullPath, part);
      name = part;
    });
    name = name.replace(/["\\/]/g, '');

    function respondArchive() {
      var archive = require('archiver').create('zip', {
        statConcurrency: 1
      });
      archive.on('error', errorHandler(res));
      archive.directory(fullPath, name);
      res.writeHead(200, {
        'Content-type': 'application/zip',
        'Content-disposition': 'attachment; filename="' + name + '.zip"'
      });
      archive.pipe(res);
      archive.finalize();
    }

    fs.stat(fullPath, function(err, stats) {
      if(err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(500);
          res.end(String(err));
        }
      } else if (!stats.isDirectory()) {
        res.writeHead(400);
        res.end('Not a directory');
      } else {
        respondArchive();
      }
    });
  };
};
