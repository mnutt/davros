var WebSocketServer = require('ws').Server;

var wss;

exports.notify = function(file) {
  if(!wss) { return; }
  console.log("FILE: " + file);

  wss.clients.forEach(function(client) {
    client.send(JSON.stringify({file: file}));
  });
};

exports.serve = function(server) {
  wss = new WebSocketServer({ server: server });
};
