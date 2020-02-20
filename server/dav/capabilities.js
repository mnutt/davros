var dav = require('./index');

exports.STATUS = JSON.stringify({
  installed: true,
  maintenance: false,
  version: '9.1.0.14',
  versionstring: '9.1.0 RC4',
  edition: ''
});

exports.CAPABILITIES = JSON.stringify({
  ocs: {
    meta: {
      status: 'ok',
      statuscode: 100,
      message: null
    },
    data: {
      version: {
        major: 9,
        minor: 1,
        micro: 0,
        string: '9.1.0 RC4',
        edition: ''
      },
      capabilities: {
        core: {
          pollinterval: 60,
          'webdav-root': dav.base.slice(1) // no leading slash
        },
        files_sharing: {
          api_enabled: false,
          public: {
            enabled: false
          },
          user: {
            send_mail: false
          },
          resharing: false,
          group_sharing: false,
          federation: {
            outgoing: false,
            incoming: false
          }
        },
        files: {
          bigfilechunking: true,
          blacklisted_files: ['.htaccess', '.jsdav'],
          undelete: false,
          versioning: false
        },
        notifications: {
          'ocs-endpoints': ['list', 'get', 'delete']
        }
      }
    }
  }
});

exports.status = function(req, res, next) {
  res.writeHead(200, {});
  res.end(exports.STATUS);
};

exports.ocs = function(req, res, next) {
  res.writeHead(200, {});
  res.end(exports.CAPABILITIES);
};
