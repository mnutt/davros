const unoconv = require('../unoconv');
const FileCache = require('../file-cache');

module.exports = function (davServer) {
  return async function (req, res, next) {
    let converter = unoconv('unoconv');

    let queryParams = new URL(req.url, true).searchParams;
    let fileUrl = queryParams.get('url');
    let timestamp = queryParams.get('ts');
    let cache = new FileCache(fileUrl, timestamp);

    const cached = await cache.get();

    if (cached) {
      cached.pipe(res);
      cached.on('end', function () {
        console.log('Unoconv cache hit for ' + fileUrl);
        cached.close();
      });
      return;
    }

    converter.outputFormat('xhtml');
    converter.set('-T 30'); // timeout after 30s

    if (fileUrl.match(/\.(xls|xlsx|ods)$/)) {
      converter.set('-d spreadsheet');
    } else if (fileUrl.match(/\.(ppt|pptx|odp)$/)) {
      converter.set('-d presentation');
    }

    req.url = fileUrl;
    req.headers['accept-encoding'] = 'identity';

    converter._headers = {};
    converter.setHeader = function (name, value) {
      this._headers[name] = value;
    };

    converter.writeHead = function (code, headers) {
      this.code = code;
      this._headers = headers;
    };

    converter.on('error', function (err) {
      if (!err.toString().match(/validity error/)) {
        console.error(err);
      }
    });

    let toCache = converter.pipe(cache);
    toCache.pipe(res);
    toCache.on('end', function () {
      console.log('Converter cache miss for ' + fileUrl);
    });

    davServer(req, converter, next);
  };
};
