var express = require('express');
var fs      = require('fs');
var api     = require('./server');
var path    = require('path');

var root = __dirname;
var indexFile = path.resolve(root + '/dist/index.html');

if(!fs.existsSync(indexFile)) {
  console.error("Missing dist/index.html; run `ember build` to generate it.");
  process.exit(1);
}

var app = express();

app.use(express.static('dist'));

api(app);

app.use('/', function(req, res, next) {
  // send ember's index.html for any unknown route
  res.sendFile(indexFile);
});

var port = process.env.PORT || 8000;
var socket = process.env.SOCKET;

if(socket) {
  app.listen(socket, function() {
    console.log('Davros listening on %s', socket);
  });
} else {
  app.listen(port, function () {
    console.log('Davros listening on port %s', port);
  });
}
