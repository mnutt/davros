var multiparty = require('multiparty');

module.exports = function(davServer) {
  return function(req, res, next) {
    var form = new multiparty.Form();

    // Unfortunately destination is sideloaded, so we have to extract it separately
    var destination;
    form.on('field', function(field, value) {
      if (field === 'destination') {
        destination = value;
      }
    });

    form.on('part', function(part) {
      part.on('error', function(err) {
        // something went wrong
        console.log('part error');
      });

      // part is already a readable stream, so make it look like a request and
      // just send it on to the dav server
      if (destination[0] !== '/') {
        destination = '/' + destination;
      }
      part.url = '/dav' + destination;
      part.method = 'PUT';
      davServer(part, res, next);
    });

    form.on('aborted', function() {
      console.log('aborted');
    });

    form.on('error', function(err) {
      res.status(500).send('error: ' + err.message);
    });

    form.parse(req);
  };
};
