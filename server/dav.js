var jsDAV = require("jsdav/lib/jsdav");
var Tree = require("jsdav/lib/DAV/backends/fsext/tree");
jsDAV.debugMode = true;
var jsDAV_Locks_Backend_FS = require("jsdav/lib/DAV/plugins/locks/fs");

// for free disk space reporting
var statvfs = require('statvfs');
fs = require('fs');
fs.statvfs = statvfs;

exports.server = function(root) {
  console.log("Mounting webdav from data dir " + root);

  var server = jsDAV.mount({
    node: root,
    tree: Tree.new(root),
    sandboxed: true,
    locksBackend: jsDAV_Locks_Backend_FS.new(root)
  });

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
  res.end('{"installed":"true","version":"5.0.17","versionstring":"5.0.10","edition":""}');
};

exports.capabilities = function(req, res, next) {
  res.writeHead(200, {});
  res.end('{"ocs":{"meta":{"status":"ok","statuscode":100,"message":null},"data":{"capabilities":{"files":{"versioning":true,"bigfilechunking":true,"undelete":true},"core":{"pollinterval":60}},"version":{"major":5,"minor":0,"micro":17,"string":"5.0.10","edition":""}}}}');
};
