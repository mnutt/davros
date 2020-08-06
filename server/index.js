// To use it create some files under `mocks/`
// e.g. `server/mocks/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };

// Try and fix weird circular dependency problem
var jsDAV_Server = require('jsDAV/lib/DAV/server');
var path = require('path');
var morgan = require('morgan');
var apiWs = require('./api-ws');
var changelog = require('./changelog');
var dav = require('./dav');
var capabilities = require('./dav/capabilities');
var publishing = require('./publishing');
var sandstormPermissions = require('./sandstorm_permissions');

var thumbnail = require('./api/thumbnail');
var fileUpload = require('./api/file-upload');
var downloadDirectory = require('./api/download-directory');
var previewDocument = require('./api/preview-document');

module.exports = function(app, options) {
  var root = path.resolve(process.env.STORAGE_PATH || __dirname + '/../data');

  apiWs.serve(options.httpServer);

  // Log proxy requests
  app.use(morgan('dev'));

  app.use(sandstormPermissions);

  // WebDAV: /remote.php/webdav/*
  var davServer = dav.server(root);
  app.use(davServer);

  app.use('/status.php', capabilities.status);
  app.use('/ocs/v1.php/cloud/capabilities', capabilities.ocs);

  app.use('/api/upload', fileUpload(davServer));
  app.use('/api/thumbnail', thumbnail(davServer));
  app.use('/api/preview', previewDocument(davServer));
  app.get('/api/archive', downloadDirectory(root));

  app.get('/api/publish/info', publishing.getInfo);
  app.post('/api/publish', publishing.publish);
  app.post('/api/unpublish', publishing.unpublish);

  app.get('/changelog', changelog);
};
