/* eslint-disable no-console */
const startTime = (global.start = new Date());

const express = require('express');
const fs = require('fs');
const api = require('./server');
const path = require('path');
const http = require('http');
const compression = require('compression');
const process = require('process');

let root = __dirname;
if (/output$/.test(root)) {
  // If we're running from bundled, need to remove output from root
  root = path.dirname(root);
}

const indexFile = path.resolve(root + '/dist/index.html');

const app = express();
const server = http.createServer(app);

app.use(compression());
app.use(express.static('dist'));

api(app, { httpServer: server });

app.use('/', function(req, res) {
  // send ember's index.html for any unknown route
  res.sendFile(indexFile);
});

const port = process.env.PORT || 8000;
const socket = process.env.SOCKET;

function listening(desc) {
  return function() {
    // We don't want to start if the UI is broken
    fs.access(indexFile, fs.constants.F_OK, function(err) {
      if (err) {
        throw new Error('Missing dist/index.html; run `ember build` to generate it.');
      }
    });

    const time = new Date() - startTime;
    console.log(`Davros started in ${time}ms, listening on ${desc}`);
  };
}

if (socket) {
  server.listen(socket, listening(socket));
} else {
  server.listen(port, listening(`port ${port}`));
}
