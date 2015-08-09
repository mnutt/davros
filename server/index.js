// To use it create some files under `mocks/`
// e.g. `server/mocks/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };

var path = require('path');
var jsDAV = require("jsdav/lib/jsdav");
var Tree = require("jsdav/lib/DAV/backends/fsext/tree");
jsDAV.debugMode = true;
var jsDAV_Locks_Backend_FS = require("jsdav/lib/DAV/plugins/locks/fs");
var api = require('./api');

module.exports = function(app) {
  var root = path.resolve(__dirname + "/../data");

  console.log("Mounting webdav from data dir " + root);

  var server = jsDAV.mount({
    node: root,
    tree: Tree.new(root),
    sandboxed: true,
    locksBackend: jsDAV_Locks_Backend_FS.new(root)
  });

  server.baseUri = '/remote.php/webdav';

  app.use(function(req, res, next) {
    if(req.url.indexOf(server.baseUri) === 0) {
      server.emit('request', req, res);
    } else {
      next();
    }
  });

  var apiServer = new api(root);
  app.use('/api/files', apiServer);

  // Log proxy requests
  var morgan  = require('morgan');
  app.use(morgan('dev'));

};
