const execFile = require('child-process-promise').execFile;
const fs = require('node:fs/promises');
const path = require('path');
const { URL } = require('url');

const destination = '/var/www';
const source = path.relative(
  path.dirname(destination),
  process.env.STORAGE_PATH || __dirname + '/../data'
);

const configPath = process.env.CONFIG_PATH || __dirname + '/../config';
const domainFilePath = [configPath, 'domain'].join('/');

// For testing outside of sandstorm
let mockDomain = null;
let mockPublishingEnabled = false;

function isNotSandstorm(req) {
  return !req.headers['x-sandstorm-session-id'];
}

exports.unpublish = function (req, res) {
  if (isNotSandstorm(req)) {
    mockDomain = null;
    mockPublishingEnabled = false;
    res.json({ success: true });
    return;
  }

  fs
    .unlink(domainFilePath)
    .catch(() => {})
    .then(() => {
      return fs.unlink(destination);
    })
    .then(() => {
      res.json({ success: true });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ success: false });
    });
};

exports.getInfo = function (req, res) {
  if (isNotSandstorm(req)) {
    if (mockPublishingEnabled) {
      res.json({
        domain: mockDomain,
        publicId: 'abc12345',
        autoUrl: 'http://localhost',
        host: 'localhost',
      });
    } else {
      res.json({});
    }
    return;
  }

  let domain;
  fs
    .readFile(domainFilePath, 'utf-8')
    .then((domainData) => {
      domain = domainData;
    })
    .catch(() => {
      /* ignore error */
    })
    .then(() => {
      return fs.stat(destination).catch(() => {});
    })
    .then((stat) => {
      if (stat) {
        var sessionId = req.headers['x-sandstorm-session-id'];
        return execFile('./sandstorm-integration/bin/getPublicId', [sessionId]);
      }
    })
    .then((result) => {
      if (result && result.stdout) {
        var stdout = result.stdout;

        var [publicId, , /* (hostname) */ autoUrl] = stdout.split('\n');
        var host = new URL(autoUrl).hostname;
        var data = { domain, publicId, autoUrl, host };

        res.json(data);
      } else {
        res.json({});
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ success: false });
    });
};

exports.publish = function (req, res, next) {
  fs
    .unlink(destination)
    .catch(() => {})
    .then(() => {
      return fs.symlink(source, destination);
    })
    .then(() => {
      const { domain } = req.query;
      if (domain) {
        return fs.writeFile(domainFilePath, domain);
      }
    })
    .then(() => {
      return exports.getInfo(req, res, next);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ success: false });
    });
};
