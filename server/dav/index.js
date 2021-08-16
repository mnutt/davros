var fs = require('fs');
var os = require('os');
const path = require('path');

const jsDAV = require('jsDAV/lib/jsdav');
const Tree = require('./backend/tree');
const jsDAV_Locks_Plugin = require('jsDAV/lib/DAV/plugins/locks');
const jsDAV_Locks_Backend_FS = require('jsDAV/lib/DAV/plugins/locks/fs');

//jsDAV.debugMode = true

// for free disk space reporting
const statvfs = require('./statvfs-shim');
fs.statvfs = statvfs;

exports.base = '/dav';

// For clients that can't handle a starting path (/dav), we want to
// serve them a dummy directory structure so that they can navigate to the actual files
const dummyServer = jsDAV.mount({
  tree: Tree.new(path.resolve(__dirname + '/../dummy')),
  sandboxed: true
});

function rewriteAlternateDavUrls(req) {
  if (req.url.startsWith('/remote.php/webdav')) {
    // Legacy ownCloud URIs
    req._baseUri = '/remote.php/webdav/';
    req.url = exports.base + req.url.slice('/remote.php/webdav'.length);
  }

  if (req.url.startsWith('/remote.php/dav/files/')) {
    // NextCloud URIs
    const slicedUrl = req.url.slice('/remote.php/dav/files/'.length);
    const nextSlash = slicedUrl.indexOf('/');
    if (nextSlash) {
      const user = slicedUrl.slice(0, nextSlash);
      req._baseUri = `/remote.php/dav/files/${user}/`;
      req.url = exports.base + slicedUrl.slice(nextSlash);
    }
  }
}

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
      'safe-gets': require('./safe-gets'),
      'rewrite-url': require('./rewrite-url'),
    }
  });

  tree.setSandbox(tree.basePath);
  require('./backend/etag').tree = tree;

  server.baseUri = exports.base + '/';

  return function(req, res, next) {
    rewriteAlternateDavUrls(req);

    if (req.url.indexOf(exports.base) === 0) {
      server.emit('request', req, res);
    } else if (req.url === '/' && req.method === 'PROPFIND') {
      dummyServer.emit('request', req, res);
    } else {
      next();
    }
  };
};
