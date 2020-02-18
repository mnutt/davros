import EmberObject from '@ember/object';
import filetypes from 'davros/lib/filetypes';
import filetypeIcons from 'davros/lib/filetype-icons';
import Webdav from 'davros/mixins/webdav';

export default EmberObject.extend(Webdav, {
  path: null,  // file's path within the dav server, excluding the dav base
  size: null,  // in bytes
  mtime: null, // modified time
  files: null, // if a directory, a list of children

  name: function() {
    return this.path.split(/[\\/]/).pop();
  }.property('path'),

  sortedFiles: function() {
    return this.files.sortBy('isFile', 'name');
  }.property('files'),

  lotsOfFiles: function() {
    return this.get('files.length') > 50;
  }.property('files.length'),

  parent: function() {
    return this.path.replace(/\/?[^\/]*\/?$/, '');
  }.property('path'),

  linkedPath: function() {
    if(this.isDirectory) {
      return this.path + "/";
    } else {
      return this.path;
    }
  }.property('path', 'isDirectory'),

  isDirectory: false,

  isFile: function() {
    return !this.isDirectory;
  }.property('isDirectory'),

  extension: function() {
    var pieces = this.name.split('.');
    if(pieces.length > 1) {
      return pieces[pieces.length - 1];
    } else {
      return '';
    }
  }.property('name'),

  type: function() {
    return filetypes[this.extension.toLowerCase()] || filetypes.defaultType;
  }.property('extension'),

  typeIcon: function() {
    return filetypeIcons[this.type];
  }.property('type'),

  typeComponent: function() {
    return `files/type-${this.type}`;
  }.property('type'),

  rawPath: function() {
    return [this.davBase, this.path].join('/');
  }.property('path', 'davBase')
});
