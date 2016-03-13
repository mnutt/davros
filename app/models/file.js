import Ember from 'ember';
import filetypes from 'davros/lib/filetypes';
import filetypeIcons from 'davros/lib/filetype-icons';
import Webdav from 'davros/mixins/webdav';

export default Ember.Object.extend(Webdav, {
  path: null,  // file's path within the dav server, excluding the dav base
  size: null,  // in bytes
  mtime: null, // modified time
  files: null, // if a directory, a list of children

  name: function() {
    return this.get('path').split(/[\\/]/).pop();
  }.property('path'),

  sortedFiles: function() {
    return this.get('files').sortBy('isFile', 'name');
  }.property('files'),

  lotsOfFiles: function() {
    return this.get('files.length') > 50;
  }.property('files.length'),

  parent: function() {
    return this.get('path').replace(/\/?[^\/]*\/?$/, '');
  }.property('path'),

  linkedPath: function() {
    if(this.get('isDirectory')) {
      return this.get('path') + "/";
    } else {
      return this.get('path');
    }
  }.property('path', 'isDirectory'),

  isDirectory: false,

  isFile: function() {
    return !this.get('isDirectory');
  }.property('isDirectory'),

  isLarge: function() {
    return this.get('size') > 2 * 1024 * 1024;
  }.property('size'),

  extension: function() {
    var pieces = this.get('name').split('.');
    if(pieces.length > 1) {
      return pieces[pieces.length - 1];
    } else {
      return '';
    }
  }.property('name'),

  type: function() {
    return filetypes[this.get('extension').toLowerCase()] || filetypes.defaultType;
  }.property('extension'),

  typeIcon: function() {
    return filetypeIcons[this.get('type')];
  }.property('type'),

  typeComponent: function() {
    return `files/type-${this.get('type')}`;
  }.property('type'),

  rawPath: function() {
    return [this.get('davBase'), this.get('path')].join('/');
  }.property('path', 'davBase')
});
