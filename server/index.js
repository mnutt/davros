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
var dav    = require('./dav');
var morgan = require('morgan');

module.exports = function(app) {
  var root = path.resolve(process.env.STORAGE_PATH || (__dirname + "/../data"));

  app.use(dav.server(root));
  app.use('/status.php', dav.status);
  app.use('/ocs/v1.php/cloud/capabilities', dav.capabilities);

  var fileServer = api.files(root);
  app.use('/api/files', fileServer);

  var uploadServer = api.upload(root);
  app.use('/api/upload', uploadServer);

  // Log proxy requests
  app.use(morgan('dev'));
};
