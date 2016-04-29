var multiparty        = require('multiparty');
var fs                = require('fs');
var path              = require('path');
var archiver          = require('archiver');

function errorHandler(res) {
  return function(err) {
    res.writeHead(500, {});
    res.end(err.message);
  };
}

exports.upload = function(davServer) {
  return function(req, res, next) {
    var form = new multiparty.Form();

    // Unfortunately destination is sideloaded, so we have to extract it separately
    var destination;
    form.on('field', function(field, value) {
      if(field === 'destination') {
        destination = value;
      }
    });

    form.on('part', function(part) {
      // part is already a readable stream, so make it look like a request and
      // just send it on to the dav server
      if(destination[0] !== '/') { destination = '/' + destination; }
      part.url = '/remote.php/webdav' + destination;
      part.method = 'PUT';
      davServer(part, res, next);
    });

    form.on('error', errorHandler(res));
    form.parse(req);
  };
};

exports.downloadDirectory = function(root) {

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
      var archive = archiver.create('zip', {
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
