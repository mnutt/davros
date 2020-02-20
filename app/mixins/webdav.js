import Mixin from '@ember/object/mixin';
import Webdav from 'davros/lib/webdav';

const propnames = ['getlastmodified', 'quota-used-bytes', 'getcontentlength', 'getdimensions'];

export default Mixin.create({
  davBase: Webdav.base,

  load: function() {
    return Webdav.propfind(this.rawPath).then((xml) => {
      let responses = [...xml.querySelectorAll('d\\:response, response')];
      let parsedResponses = responses.map(this.parseResponse.bind(this));
      parsedResponses.sort((a, b) => {
        return a.path.length - b.path.length;
      });

      this.loadFromResponse(parsedResponses.shift());

      if(responses.length > 0) {
        this.loadChildren(parsedResponses);
      }

      return this;
    });
  },

  delete: function() {
    return Webdav.delete(this.rawPath);
  },

  loadFromResponse: function(response) {
    this.setProperties(response);
  },

  parseResponse: function(doc) {
    let path = doc.querySelector('d\\:href, href').innerHTML;
    path = path.slice(this.get('davBase.length') + 1).replace(/\/$/, '');
    let isDirectory = doc.querySelectorAll('d\\:collection, collection').length > 0;
    path = decodeURIComponent(path);

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
      mtime: new Date(props.getlastmodified),
      size,
      files
    };
  },

  loadChildren: function(parsedResponses) {
    var files = [];
    for(var i = 0; i < parsedResponses.length; i++) {
      var file = this.constructor.create();
      file.loadFromResponse(parsedResponses[i]);
      files.push(file);
    }
    this.set('files', files);
  }
});
