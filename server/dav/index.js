var fs = require('fs');
var os = require('os');
const path = require('path');

const jsDAV = require('jsDAV/lib/jsdav');
const Tree = require('./backend/tree');
const UploadTree = require('./backend/uploads/tree');
const jsDAV_Locks_Plugin = require('jsDAV/lib/DAV/plugins/locks');
const jsDAV_Locks_Backend_FS = require('jsDAV/lib/DAV/plugins/locks/fs');

//jsDAV.debugMode = true

// for free disk space reporting
const statvfs = require('./statvfs-shim');
fs.statvfs = statvfs;

exports.base = '/dav';
exports.uploadBase = '/uploads';

// For clients that can't handle a starting path (/dav), we want to
// serve them a dummy directory structure so that they can navigate to the actual files
const dummyServer = jsDAV.mount({
  tree: Tree.new(path.resolve(__dirname + '/../dummy')),
  sandboxed: true,
  plugins: {},
});

function getRealDavUrl(url, prefix, base) {
  const slicedUrl = url.slice(prefix.length);

  let nextSlash = slicedUrl.indexOf('/');
  if (nextSlash === -1) {
    // For top-level user directory without a trailing slash
    nextSlash = slicedUrl.length;
  }

  const user = slicedUrl.slice(0, nextSlash);
  return { base: `${prefix}${user}/`, url: base + slicedUrl.slice(nextSlash) };
}

function rewriteAlternateDavUrls(req) {
  if (req.url.startsWith('/remote.php/webdav')) {
    // Legacy ownCloud URIs
    req._baseUri = '/remote.php/webdav/';
    req.url = exports.base + req.url.slice('/remote.php/webdav'.length);
  }

  if (req.url.startsWith('/remote.php/dav/files/')) {
    // NextCloud URIs
    const { base, url } = getRealDavUrl(req.url, '/remote.php/dav/files/', exports.base);
    req._baseUri = base;
    req.url = url;
  }

  if (req.url.startsWith('/remote.php/dav/uploads/')) {
    // NextCloud URIs
    const { base, url } = getRealDavUrl(req.url, '/remote.php/dav/uploads/', exports.uploadBase);
    req._baseUri = base;
    req.url = url;
  }

  if (
    req.headers['destination'] &&
    req.headers['destination'].startsWith('/remote.php/dav/files/')
  ) {
    const { url } = getRealDavUrl(
      req.headers['destination'],
      '/remote.php/dav/files/',
      exports.base
    );
    req.headers['destination'] = url;
  }
}

exports.server = function (root) {
  // eslint-disable-next-line no-console
  console.log('Mounting webdav from data dir ' + root);

  const tempDir = os.tmpdir();
  fs.mkdirSync(path.join(tempDir, 'uploads'), { recursive: true });

  // eslint-disable-next-line no-console
  console.log('Storing temporary files in ' + tempDir);

  const tree = Tree.new(root);

  const server = jsDAV.mount({
    tree: tree,
    tmpDir: tempDir,
    sandboxed: true,
    locksBackend: jsDAV_Locks_Backend_FS.new(root),
    plugins: {
      'log-errors': require('./errors'),
      'ws-notify': require('./notify'),
      'root-delete': require('./root-delete'),
      locks: jsDAV_Locks_Plugin,
      mtime: require('./mtime'),
      'safe-gets': require('./safe-gets'),
      'rewrite-url': require('./rewrite-url'),
    },
  });

  tree.setSandbox(tree.basePath);
  require('./backend/etag').tree = tree;

  const uploadTree = UploadTree.new(tempDir);
  uploadTree.fileTree = tree;

  const uploadServer = jsDAV.mount({
    tree: uploadTree,
    tmpDir: tempDir,
    sandboxed: true,
    locksBackend: jsDAV_Locks_Backend_FS.new(tempDir),
    plugins: {
      'log-errors': require('./errors'),
      locks: jsDAV_Locks_Plugin,
      mtime: require('./mtime'),
      'safe-gets': require('./safe-gets'),
      'setup-upload': require('./backend/uploads/setup-upload'),
    },
  });
  uploadTree.setSandbox(uploadTree.basePath);

  server.baseUri = exports.base + '/';

  return function (req, res, next) {
    rewriteAlternateDavUrls(req);

    if (req.url.indexOf(exports.base) === 0) {
      server.emit('request', req, res);
    } else if (req.url === '/' && req.method === 'PROPFIND') {
      // If webdav client tries to make a PROPFIND to /, show them a listing for the /dav directory
      dummyServer.emit('request', req, res);
    } else if (req.url.indexOf(exports.uploadBase) === 0) {
      // Special temporary upload dav area to support Nextcloud/ownCloud clients
      uploadServer.emit('request', req, res);
    } else {
      next();
    }
  };
};
