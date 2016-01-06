var multiparty        = require('multiparty');

exports.upload = function(davServer) {
  return function(req, res, next) {
    var form = new multiparty.Form();

    // Unfortunately destination is sideloaded, so we have to extract it separately
    var destination;
    form.on('field', function(field, value) {
      if(field === 'destination') {
        destination = value;
      }
    });

    form.on('part', function(part) {
      // part is already a readable stream, so make it look like a request and
      // just send it on to the dav server
      part.url = '/remote.php/webdav/' + destination;
      part.method = 'PUT';
      davServer(part, res, next);
    });

    form.on('error', function(err) {
      res.writeHead(500, {});
      res.end(err.message);
    });

    form.parse(req);
  };
};
