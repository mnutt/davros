var os                = require('os');
var url               = require('url');
var FileCache         = require('../file-cache');
var im                = require('imagemagick-stream');

var tempDir = os.tmpdir();

const resizeOperations = {
  'smaller': '>',
  'fit': '^'
};

const resizeOperationNames = {
  '>': 'smaller',
  '^': 'fit'
};

module.exports = function(davServer) {
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

    let cacheKey = [w, h, resizeOperationNames[op], queryParams.url].join("-");
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

        // Only use the first frame, if animated
        thumbnailer.input = "-[0]";

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
