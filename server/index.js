// To use it create some files under `mocks/`
// e.g. `server/mocks/ember-hamsters.js`
//
// module.exports = function(app) {
//   app.get('/ember-hamsters', function(req, res) {
//     res.send('hello');
//   });
// };

var path   = require('path');
var api    = require('./api');
var apiWs  = require('./api-ws');
var dav    = require('./dav');
var morgan = require('morgan');
var express = require('express');
var signature = require('./signature');
var publishing = require('./publishing');
var sandstormPermissions = require('./sandstorm_permissions');
var changelog = require('./changelog');

module.exports = function(app, options) {
  var root = path.resolve(process.env.STORAGE_PATH || (__dirname + "/../data"));

  apiWs.serve(options.httpServer);

  // Log proxy requests
  app.use(morgan('dev'));

  app.use(sandstormPermissions);

  var davServer = dav.server(root);
  app.use(davServer);
  app.use('/status.php', dav.status);
  app.use('/ocs/v1.php/cloud/capabilities', dav.capabilities);

  var uploadServer = api.upload(davServer);
  app.use('/api/upload', uploadServer);
  app.use('/api/signature', signature.get());

  app.get('/api/publish/info', publishing.getInfo);
  app.post('/api/publish', publishing.publish);
  app.post('/api/unpublish', publishing.unpublish);

  app.get('/changelog', changelog);

};
