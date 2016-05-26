var crypto = require('crypto');
var url = require('url');

// Token storage. Key is the token, value is the path.
var tokens = {};

function generateToken() {
  return crypto.randomBytes(64).toString('hex');
}

// Generate a random token, store it for 5 minutes, return it
exports.create = function(path) {
  var token = generateToken(path);
  tokens[token] = path;

  // 5-minute token expiration
  setTimeout(function() { delete tokens[token]; }, 5 * 60 * 1000);

  return token;
};

// Check that token exists and is being used for the path it was originally
// generated for. Afterwards, delete it since it is single-use.
exports.verify = function(token, path) {
  var tokenPath = tokens[token];

  delete tokens[token];
  return tokenPath && (path.indexOf(tokenPath) === 0);
};

exports.get = function() {
  return function get(req, res, next) {
    var query = url.parse(req.url, true).query;
    var signature = exports.create(query.path);

    res.writeHead(200, {});
    res.end(JSON.stringify({path: query.path, signature: signature}));
  };
};

exports.check = function() {
  return function check(req, res, next) {
    var query = url.parse(req.url, true).query;
    if(exports.verify(query.signature, req.url)) {
      next();
    } else {
      res.writeHead(400, {});
      res.end("Missing or invalid signature: " + query.signature);
    }
  };
};
