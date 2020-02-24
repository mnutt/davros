var fs = require('fs');
var os = require('os');

const jsDAV = require('jsDAV/lib/jsdav');
const Tree = require('./backend/tree');
const jsDAV_Locks_Plugin = require('jsDAV/lib/dav/plugins/locks');
const jsDAV_Locks_Backend_FS = require('jsDAV/lib/DAV/plugins/locks/fs');

//jsDAV.debugMode = true

// for free disk space reporting
const statvfs = require('./statvfs-shim');
fs.statvfs = statvfs;

exports.base = '/remote.php/webdav';

exports.server = function(root) {
  // eslint-disable-next-line no-console
  console.log('Mounting webdav from data dir ' + root);

  const tempDir = os.tmpdir();
  // eslint-disable-next-line no-console
  console.log('Storing temporary files in ' + tempDir);

  const tree = Tree.new(root);

  const server = jsDAV.mount({
    tree: tree,
    tmpDir: tempDir,
    sandboxed: true,
    locksBackend: jsDAV_Locks_Backend_FS.new(root),
    plugins: {
      'ws-notify': require('./notify'),
      'root-delete': require('./root-delete'),
      locks: jsDAV_Locks_Plugin,
      mtime: require('./mtime'),
      'safe-gets': require('./safe-gets')
    }
  });

  tree.setSandbox(tree.basePath);
  require('./backend/etag').tree = tree;

  server.baseUri = exports.base + '/';

  return function(req, res, next) {
    if (req.url.indexOf(exports.base) === 0) {
      server.emit('request', req, res);
    } else {
      next();
    }
  };
};
