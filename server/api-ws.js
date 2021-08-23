const WebSocket = require('ws');

let wss;

exports.notify = function(file) {
  if (!wss) {
    return;
  }

  const response = JSON.stringify({ file: file });

  for (const client of wss.clients) {
    client.send(response);
  }
};

exports.serve = function(server) {
  wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', function upgrade(request, socket, head) {
    if (request.url.startsWith('/ws-files')) {
      wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('error', err => console.error(err));
};
