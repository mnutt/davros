const FileCache = require('../file-cache');
const { URL } = require('url');
const path = require('path');
const { PassThrough } = require('stream');
const officePreview = require('../powerbox/office-preview');

const SUPPORTED_EXTENSIONS = new Set(['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp']);

function extensionFor(fileUrl) {
  try {
    return path.extname(new URL(fileUrl, 'http://dummy').pathname).toLowerCase();
  } catch (err) {
    return '';
  }
}

function readFileViaDavStream(davServer, req, fileUrl) {
  const sink = new PassThrough();
  let statusCode = 200;

  function failWithStatus(code) {
    if (code >= 400) {
      sink.destroy(new Error(`DAV request failed with ${code}`));
      return true;
    }

    return false;
  }

  sink._headers = {};
  sink.setHeader = function (name, value) {
    this._headers[name.toLowerCase()] = value;
  };
  sink.writeHead = function (code, headers = {}) {
    statusCode = code;
    this._headers = Object.fromEntries(
      Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value])
    );

    failWithStatus(statusCode);
  };
  sink.status = function (code) {
    statusCode = code;
    failWithStatus(statusCode);
    return this;
  };
  sink.send = function (body) {
    if (failWithStatus(statusCode)) {
      return;
    }

    if (body) {
      this.write(Buffer.from(body));
    }
    this.end();
  };

  const davReq = Object.create(req);
  davReq.url = fileUrl;
  davReq.headers = { ...(req.headers || {}), 'accept-encoding': 'identity' };

  const forwardDavError = function (err) {
    if (err) {
      sink.destroy(err);
    }
  };

  davServer(davReq, sink, forwardDavError);

  return sink;
}

function filenameFor(fileUrl) {
  try {
    return decodeURIComponent(path.basename(new URL(fileUrl, 'http://dummy').pathname));
  } catch (err) {
    return 'document';
  }
}

function isStaleCapabilityError(err) {
  const message = String((err && err.message) || err || '').toLowerCase();
  return (
    message.includes('no such token') ||
    message.includes('invalid token') ||
    message.includes('token expired') ||
    message.includes('unauthorized')
  );
}

module.exports = function (davServer) {
  return async function (req, res) {
    let queryParams;

    try {
      queryParams = new URL(req.url, 'http://dummy').searchParams;
    } catch (err) {
      res.status(400).send('Invalid preview request URL');
      return;
    }

    let fileUrl = queryParams.get('url');
    let timestamp = queryParams.get('ts');

    if (!fileUrl) {
      res.status(400).send('Missing file URL');
      return;
    }

    if (!SUPPORTED_EXTENSIONS.has(extensionFor(fileUrl))) {
      res.status(415).send('Unsupported office document type for preview');
      return;
    }

    const cache = new FileCache(fileUrl, timestamp);

    const cached = await cache.get();

    if (cached) {
      res.type('application/pdf');
      cached.pipe(res);
      cached.on('end', function () {
        console.log('Office preview cache hit for ' + fileUrl);
        cached.close();
      });
      return;
    }

    const cap = await officePreview.getCapability();
    if (!cap) {
      res.status(428).json({
        powerboxRequired: true,
        queryDescriptor: officePreview.getPowerboxQueryDescriptor(),
      });
      return;
    }

    try {
      const source = readFileViaDavStream(davServer, req, fileUrl);
      const pdfStream = await officePreview.convertOfficeToPdf(source, filenameFor(fileUrl), cap);
      res.type('application/pdf');

      let toCache = pdfStream.pipe(cache);
      toCache.pipe(res);
      toCache.on('end', function () {
        console.log('Office preview cache miss for ' + fileUrl);
      });
    } catch (err) {
      if (isStaleCapabilityError(err)) {
        await officePreview.clearCapability();
        res.status(428).json({
          powerboxRequired: true,
          queryDescriptor: officePreview.getPowerboxQueryDescriptor(),
        });
        return;
      }

      console.error(err);
      res.status(502).send('Failed to render this document preview');
    }
  };
};
