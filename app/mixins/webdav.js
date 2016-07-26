import Ember from 'ember';
import Webdav from 'davros/lib/webdav';
import jQuery from 'jquery';

export default Ember.Mixin.create({
  davBase: Webdav.base,

  load: function() {
    return Webdav.propfind(this.get('rawPath')).then((xml) => {
      let responses = jQuery.makeArray(xml.querySelectorAll('d\\:response, response'));
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
    return Webdav.delete(this.get('rawPath'));
  },

  loadFromResponse: function(response) {
    this.setProperties(response);
  },

  parseResponse: function(response) {
    let doc = jQuery(response);
    let path = doc.find('d\\:href, href').text();
    path = path.slice(this.get('davBase.length') + 1).replace(/\/$/, '');
    let isDirectory = doc.find('d\\:collection, collection').length > 0;
    path = decodeURIComponent(path);
    let mtime = new Date(doc.find('d\\:getlastmodified, getlastmodified').text());

    let size, files;
    if(isDirectory) {
      size = parseInt(doc.find('d\\:quota-used-bytes, quota-used-bytes').text(), 10);
      files = [];
    } else {
      size = parseInt(doc.find('d\\:getcontentlength, getcontentlength').text(), 10) || 0;
    }

    return {
      path, isDirectory, mtime, size, files
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
