var multiparty        = require('multiparty');
var fs                = require('fs');
var os                = require('os');
var path              = require('path');
var url               = require('url');
var archiver          = require('archiver');
var im                = require('imagemagick-stream');
var FileCache         = require('./file-cache');

function errorHandler(res) {
  return function(err) {
    res.writeHead(500, {});
    res.end(err.message);
  };
}

const resizeOperations = {
  'smaller': '>',
  'fit': '^'
};

var tempDir = os.tmpdir();

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

exports.thumbnail = function(davServer) {
  function addListeners (stream, on, listeners) {
    for (var i = 0; i < listeners.length; i++) {
      on.apply(stream, listeners[i]);
    }
  }

  return function(req, res, next) {
    let thumbnailer = im().quality(90);

    let queryParams = url.parse(req.url, true).query;
    let w = Math.max(Math.min(parseInt(queryParams.width, 10) || 10, 5000), 1);
    let h = Math.max(Math.min(parseInt(queryParams.height, 10)|| 10, 5000), 1);
    let op = resizeOperations[queryParams.op] || '^';
    let timestamp = queryParams.ts;

    let cacheKey = [w, h, op, queryParams.url].join(":");
    let cache = new FileCache(tempDir, cacheKey, timestamp);
    cache.get((cached, path) => {
      if(cached) {
        cached.pipe(res);
        cached.on('end', function() {
          console.log("Thumbnailer cache hit for " + cacheKey);
        });
      } else {
        thumbnailer.quality(90);
        thumbnailer.resize(`${w}x${h}${op}`);

        if(op === '^') {
          thumbnailer.gravity('center');
          thumbnailer.op('repage', '0x0+0+0');
          thumbnailer.crop(`${w}x${h}+0+0`);
          thumbnailer.op('repage', '0x0+0+0');
        }

        req.url = queryParams.url;
        req.headers['accept-encoding'] = 'identity';

        thumbnailer._headers = {};
        thumbnailer.setHeader = function(name, value) {
          this._headers[name] = value;
        };

        thumbnailer.writeHead = function(code, headers) {
          this.code = code;
          this._headers = headers;
        };

        thumbnailer.on('error', function(err) {
          console.error(err);
        });

        let cached = thumbnailer.pipe(cache);
        cached.pipe(res);
        cached.on('end', function() {
          console.log("Thumbnailer cache miss for " + cacheKey);
        });

        davServer(req, thumbnailer, next);
      }
    });
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
