var startTime = new Date();
require('cache-require-paths');

var express = require('express');
var fs = require('fs');
var api = require('./server');
var path = require('path');
var http = require('http');
var compression = require('compression');

var root = __dirname;
var indexFile = path.resolve(root + '/dist/index.html');

fs.access(indexFile, fs.constants.F_OK, function(err) {
  if (err) {
    console.error('Missing dist/index.html; run `ember build` to generate it.');
    process.exit(1);
  }
});

var app = express();
var server = http.createServer(app);

app.use(compression());
app.use(express.static('dist'));

api(app, { httpServer: server });

app.use('/', function(req, res, next) {
  // send ember's index.html for any unknown route
  res.sendFile(indexFile);
});

var port = process.env.PORT || 8000;
var socket = process.env.SOCKET;

if (socket) {
  server.listen(socket, function() {
    console.log('Davros listening on %s', socket);
  });
} else {
  server.listen(port, function() {
    var time = new Date() - startTime;
    console.log('Davros started in %sms, listening on port %s', time, port);
  });
}
