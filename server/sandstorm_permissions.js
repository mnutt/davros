var readMethods = {
  'GET': true,
  'HEAD': true,
  'OPTIONS': true,
  'PROPFIND': true,
  'REPORT': true
};

var validate = {
  edit: function validateEdit(req) {
    return true;
  },

  view: function validateView(req) {
    return readMethods[req.method];
  },

  sync: function validateSync(req) {
    return readMethods[req.method];
  }
};

module.exports = function(req, res, next) {
  var permissions = req.headers['x-sandstorm-permissions'];

  if(permissions) {
    permissions = permissions.split(',');

    if(req.url === '/api/permissions') {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({permissions: permissions}));
      return;
    }

    for(var i = 0; i < permissions.length; i++) {
      var permission = permissions[i];

      if(validate[permission] && validate[permission](req)) {
        return next();
      }
    }
    res.writeHead(403, {});
    res.end("Access denied.");
  } else {
    if(req.url === '/api/permissions') {
      res.writeHead(404, {});
      res.end();
    } else {
      next();
    }
  }
};
