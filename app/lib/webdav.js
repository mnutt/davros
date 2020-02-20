import fetch from 'fetch';

const propFindQuery = new Blob(
  [
    [
      '<?xml version="1.0" ?>',
      '<D:propfind xmlns:D="DAV:">',
      '  <D:prop>',
      '    <D:getdimensions/>',
      '    <D:getlastmodified/>',
      '    <D:resourcetype/>',
      '    <D:getetag/>',
      '    <D:quota-used-bytes/>',
      '    <D:quota-available-bytes/>',
      '    <D:getcontenttype/>',
      '    <D:getcontentlength/>',
      '  </D:prop>',
      '</D:propfind>'
    ].join('\n')
  ],
  { type: 'application/xml' }
);

export default {
  base: '/remote.php/webdav',

  propfind: function(path) {
    return fetch(path, {
      method: 'PROPFIND',
      headers: {
        'Content-Type': 'application/xml',
        Depth: '1'
      },
      body: propFindQuery
    })
      .then(function(response) {
        if (response.status >= 200 && response.status < 400) {
          return response.text();
        } else {
          if (response.status === 404) {
            throw new Error(`404 Not Found`);
          } else {
            throw new Error(`${response.status} Error`);
          }
        }
      })
      .then(function(raw) {
        const domParser = new DOMParser();
        return domParser.parseFromString(raw, 'application/xml');
      });
  },

  delete: function(path) {
    return fetch(path, {
      method: 'DELETE'
    });
  },

  mkcol: function(path) {
    return fetch(path, {
      method: 'MKCOL'
    }).catch(function(err) {
      console.error(err);
    });
  }
};
