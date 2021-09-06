import fetch from 'fetch';

const propnames = ['getlastmodified', 'quota-used-bytes', 'getcontentlength', 'getdimensions'];

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
      '</D:propfind>',
    ].join('\n'),
  ],
  { type: 'application/xml' }
);

export default class WebdavClient {
  constructor(base) {
    this.base = base;
  }

  fullPath(path) {
    return [this.base, path].join('/');
  }

  propfind(path) {
    return fetch(this.fullPath(path), {
      method: 'PROPFIND',
      headers: {
        'Content-Type': 'application/xml',
        Depth: '1',
      },
      body: propFindQuery,
    })
      .then(function (response) {
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
      .then(function (raw) {
        const domParser = new DOMParser();
        return domParser.parseFromString(raw, 'application/xml');
      });
  }

  remove(path) {
    return fetch(this.fullPath(path), {
      method: 'DELETE',
    });
  }

  move(path, destination) {
    const { protocol, host } = document.location;
    const fullDestination = [protocol, '//', host, this.fullPath(destination)].join('');

    return fetch(this.fullPath(path), {
      method: 'MOVE',
      headers: {
        Destination: fullDestination,
      },
    });
  }

  mkcol(path) {
    return fetch(this.fullPath(encodeURIComponent(path)), {
      method: 'MKCOL',
    }).catch(function (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    });
  }

  async load(path) {
    const xml = await this.propfind(path);
    const responses = [...xml.querySelectorAll('d\\:response, response')];
    let parsedResponses = responses.map((r) => this.parseResponse(r));

    parsedResponses.sort((a, b) => {
      return a.path.length - b.path.length;
    });

    return parsedResponses;
  }

  parseResponse(doc) {
    let path = doc.querySelector('d\\:href, href').textContent;
    path = path.slice(this.base.length + 1).replace(/\/$/, '');
    let isDirectory = doc.querySelectorAll('d\\:collection, collection').length > 0;

    const props = {};
    for (let name of propnames) {
      const el = doc.querySelector(`d\\:${name}, ${name}`);
      if (el) {
        props[name] = el.innerHTML;
      }
    }

    let size, files;
    if (isDirectory) {
      size = parseInt(props['quota-used-bytes'], 10) || 0;
      files = [];
    } else {
      size = parseInt(props.getcontentlength, 10) || 0;
    }

    const dimensions = props.getdimensions ? JSON.parse(props.getdimensions) : null;

    return {
      path,
      isDirectory,
      dimensions,
      mtime: new Date(props.getlastmodified || new Date()),
      size,
      files,
    };
  }
}
