var fs = require('fs');
var path = require('path');

function errorHandler(res) {
  return function (err) {
    res.writeHead(500, {});
    res.end(err.message);
  };
}

module.exports = function (root) {
  // ignore relative or empty path components
  var ignoredComponents = ['', '.', '..'];

  return function (req, res) {
    var relPath = req.query.path;
    if (typeof relPath !== 'string' || relPath === '') {
      res.writeHead(400);
      res.end('Missing or invalid path');
      return;
    }

    var fullPath = root;
    var name = 'home';
    relPath.split('/').forEach(function (part) {
      if (ignoredComponents.indexOf(part) !== -1) {
        return;
      }
      fullPath = path.join(fullPath, part);
      name = part;
    });
    name = name.replace(/["\\/]/g, '');

    // Resolve symlinks and confirm the target stays within the storage root,
    // so a symlink inside the data dir can't be used to archive files outside it.
    var resolvedRoot = fs.realpathSync(root);
    var resolvedPath;
    try {
      resolvedPath = fs.realpathSync(fullPath);
    } catch (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'File not found' : String(err));
      return;
    }
    if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(resolvedRoot + path.sep)) {
      res.writeHead(403);
      res.end('Access denied');
      return;
    }
    fullPath = resolvedPath;

    function respondArchive() {
      var archive = require('archiver').create('zip', {
        statConcurrency: 1,
      });
      archive.on('error', errorHandler(res));
      archive.directory(fullPath, name);
      res.writeHead(200, {
        'Content-type': 'application/zip',
        'Content-disposition': 'attachment; filename="' + name + '.zip"',
      });
      archive.pipe(res);
      archive.finalize();
    }

    fs.stat(fullPath, function (err, stats) {
      if (err) {
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
