/* eslint-disable no-console */
const { URL } = require('url');
const FileCache = require('../file-cache');
const pixel = require('../pixel');

const fits = {
  cover: 'cover',
  contain: 'contain'
};

function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}

module.exports = function(davServer) {
  return async function(req, res, next) {
    const sharp = require('sharp');

    const { searchParams } = new URL(req.url, 'http://dummy');
    const width = clamp(parseInt(searchParams.get('width'), 10), 1, 3000);
    const height = clamp(parseInt(searchParams.get('height'), 10), 1, 3000);

    const position = 'center';
    const fit = fits[searchParams.get('fit')] || 'cover';
    const timestamp = searchParams.get('ts');
    const path = searchParams.get('url');

    const cacheKey = [width, height, path].join('-');
    const cache = new FileCache(cacheKey, timestamp);

    const cached = await cache.get();

    if (cached) {
      cached.pipe(res);
      cached.on('end', function() {
        console.log('Thumbnailer cache hit for ' + cacheKey);
        cached.close();
      });
      return;
    }
    console.log('CACHE KEY', cacheKey);

    let thumb = sharp().resize({
      width,
      height,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      position,
      fit
    });

    thumb.on('error', e => pixel.handleError(e, res, 'resize', true));

    const toCache = thumb.pipe(cache);
    toCache.pipe(res);

    req.url = path;
    req.headers['accept-encoding'] = 'identity';

    thumb._headers = {};
    thumb.setHeader = function(name, value) {
      this._headers[name] = value;
    };

    thumb.writeHead = function(code, headers) {
      this.code = code;
      this._headers = headers;
    };

    thumb.on('error', function(err) {
      console.error(err);
    });

    toCache.on('end', function() {
      console.log('Thumbnailer cache miss for ' + cacheKey);
    });

    davServer(req, thumb, next);
  };
};
