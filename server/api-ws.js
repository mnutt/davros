const WebSocket = require('ws');

let wss;

function normalizePath(path) {
  if (path == null) {
    return '';
  }

  const normalized = String(path).replace(/^\/+/, '').replace(/\/+$/, '');
  if (normalized === '') {
    return '';
  }

  return normalized
    .split('/')
    .map((segment) => {
      if (!segment) {
        return '';
      }

      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch (_error) {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}

exports.notify = function (file) {
  if (!wss) {
    return;
  }

  const response = JSON.stringify({ file: normalizePath(file) });
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) {
      continue;
    }

    client.send(response);
  }
};

exports.serve = function (server) {
  wss = new WebSocket.Server({ noServer: true });

  if (server) {
    server.on('upgrade', function upgrade(request, socket, head) {
      if (request.url.startsWith('/ws-files')) {
        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit('connection', ws, request);
        });
      }
    });
  }

  wss.on('error', (err) => console.error(err));
};

exports.normalizePath = normalizePath;
