var Fs = require('fs');
var Fsp = Fs.promises;
var Path = require('path');
var Crypto = require('crypto');

var jsDAV_ServerPlugin = require('jsDAV/lib/DAV/plugin');
var Util = require('jsDAV/lib/shared/util');

var jsDAV_SetupUpload_Plugin = (module.exports = jsDAV_ServerPlugin.extend({
  name: 'setup-upload',

  initialize: function(handler) {
    this.handler = handler;

    handler.addEventListener('beforeMethod', this.beforeMethodHandler.bind(this));
    handler.addEventListener('afterBind', this.afterBindHandler.bind(this));
  },

  beforeMethodHandler: async function(e, method, uri) {
    if (method === 'MOVE' && uri.startsWith('uploads/') && uri.endsWith('.file')) {
      const checksum = this.handler.httpRequest.headers['oc-checksum'];

      if (!checksum) {
        e.error(new Error("No checksum header provided for upload completion"));
        return;
      }

      const [checksumType, hash] = checksum.split(":");

      const computed = await this.getChecksum(checksumType, uri);
      if (computed !== hash) {
        e.error(new Error(`File checksum mismatch: ${hash} !== ${computed}`));
        return;
      }
    }

    e.next();
  },

  getChecksum: async function(type, path) {
    if (type !== "SHA1") {
      throw new Error(`Unknown hash type: ${type}`);
    }

    return new Promise((resolve, reject) => {
      this.handler.getNodeForPath(path, (err, node) => {
        if (err) {
          return reject(err);
        }

        var shasum = Crypto.createHash(type.toLowerCase());
        const file = Fs.createReadStream(node.path);

        file.on('data', (chunk) => shasum.update(chunk));
        file.on('error', reject);
        file.on('end', function() {
          resolve(shasum.digest('hex'));
        });
      });
    });
  },

  afterBindHandler: async function(e, destination) {
    if (!destination.startsWith('dav')) {
      e.next();
      return;
    }

    this.handler.server.tree.getNodeForPath(destination, async (err, node) => {
      if (err) {
        e.error(err);
        return;
      }
      const { headers } = this.handler.httpRequest;
      const mtime = parseInt(headers['x-oc-mtime']);

      if (mtime) {
        await Fsp.utimes(node.path, mtime, mtime);
        this.handler.httpResponse.setHeader('x-oc-mtime', 'accepted');
      }

      node.getETag((err, etag) => {
        if (err) {
          e.error(err);
        } else {
          this.handler.httpResponse.setHeader('etag', etag);
          e.next();
        }
      });
    });
  },
}));
