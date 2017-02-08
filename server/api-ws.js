const WebSocket = require('ws');

let wss;

exports.notify = function(file) {
  if(!wss) { return; }

  const response = JSON.stringify({file: file});

  for(const client of wss.clients) {
    client.send(response);
  }
};

exports.serve = function(server) {
  wss = new WebSocket.Server({ server: server });
};
