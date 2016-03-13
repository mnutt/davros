var crypto = require('crypto');
var url = require('url');

// Keep up to two secrets, the old and the new one. Rotate them out periodically.
var secrets = [];
var currentSecret;

function generateSecret() {
  var secret = crypto.randomBytes(64).toString('hex');
  currentSecret = secret;
  secrets.unshift(secret);
  if(secrets.length > 2) { secrets.pop(); }
}

setTimeout(generateSecret, 10 * 60 * 1000);
generateSecret();

exports.create = function(d) {
  var hmac = crypto.createHmac('sha256', currentSecret);
  hmac.update(d.toString());
  return [d, hmac.digest('hex')].join('-');
};

exports.verify = function(check) {
  var parts = check.split("-");
  var date = parts[0], signature = parts[1];

  for(var i = 0; i < secrets.length; i++) {
    if(check === exports.create(date)) { return true; }
  }
  return false;
};

exports.get = function() {
  return function get(req, res, next) {
    var signature = exports.create((new Date()).getTime());

    console.log(signature);
    res.writeHead(200, {});
    res.end(JSON.stringify({signature: signature}));
  };
};

exports.check = function() {
  return function check(req, res, next) {
    var query = url.parse(req.url, true).query;
    if(exports.verify(query.signature)) {
      next();
    } else {
      res.writeHead(400, {});
      res.end("Missing or invalid signature: " + query.signature);
    }
  };
};
