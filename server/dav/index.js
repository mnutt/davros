var fs = require('fs');
var os = require('os');

var jsDAV = require('jsDAV/lib/jsdav');
var jsDAV_Server = require('jsDAV/lib/DAV/server');
var jsDAV_Util = require('jsDAV/lib/shared/util');
var Tree = require('./backend/tree');
var jsDAV_Locks_Backend_FS = require('jsDAV/lib/DAV/plugins/locks/fs');

//jsDAV.debugMode = true

// for free disk space reporting
var statvfs = require('./statvfs-shim');
fs.statvfs = statvfs;

exports.base = '/remote.php/webdav';

exports.server = function(root) {
  console.log('Mounting webdav from data dir ' + root);

  var tempDir = os.tmpdir();
  console.log('Storing temporary files in ' + tempDir);

  var tree = Tree.new(root);

  var server = jsDAV.mount({
    tree: tree,
    tmpDir: tempDir,
    sandboxed: true,
    locksBackend: jsDAV_Locks_Backend_FS.new(root),
    plugins: jsDAV_Util.extend(jsDAV_Server.DEFAULT_PLUGINS, {
      'ws-notify': require('./notify'),
      'root-delete': require('./root-delete'),
      mtime: require('./mtime'),
      'safe-gets': require('./safe-gets')
    })
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
