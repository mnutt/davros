var fs = require('fs');
var os = require('os');

var jsDAV                  = require("jsDAV/lib/jsdav");
var jsDAV_Server           = require("jsDAV/lib/DAV/server");
var jsDAV_Util             = require("jsDAV/lib/shared/util");
var Tree                   = require("./backend/tree");
var jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");

//jsDAV.debugMode = true

// for free disk space reporting
var statvfs = require('./statvfs-shim');
fs.statvfs = statvfs;

exports.server = function(root) {
  console.log("Mounting webdav from data dir " + root);

  var tempDir = os.tmpdir();
  console.log("Storing temporary files in " + tempDir);

  var tree = Tree.new(root);

  var server = jsDAV.mount({
    tree: tree,
    tmpDir: tempDir,
    sandboxed: true,
    locksBackend: jsDAV_Locks_Backend_FS.new(root),
    plugins: jsDAV_Util.extend(jsDAV_Server.DEFAULT_PLUGINS, {
      "ws-notify": require("./notify"),
      "root-delete": require("./root-delete"),
      "safe-gets": require("./safe-gets")
    })
  });

  tree.setSandbox(tree.basePath);
  require('./backend/etag').tree = tree;

  server.baseUri = '/remote.php/webdav/';
  var baseUri = server.baseUri.slice(0, -1);

  return function(req, res, next) {
    if(req.url.indexOf(baseUri) === 0) {
      server.emit('request', req, res);
    } else {
      next();
    }
  };
};

exports.status = function(req, res, next) {
  res.writeHead(200, {});
  res.end('{"installed":"true","version":"8.2.5","versionstring":"8.2.5","edition":""}');
};

exports.capabilities = function(req, res, next) {
  res.writeHead(200, {});
  res.end('{"ocs":{"meta":{"status":"ok","statuscode":100,"message":null},"data":{"capabilities":{"files":{"versioning":true,"bigfilechunking":true,"undelete":true},"core":{"pollinterval":60}},"version":{"major":5,"minor":0,"micro":17,"string":"5.0.10","edition":""}}}}');
};
