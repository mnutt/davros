import { computed } from '@ember/object';
import EmberObject from '@ember/object';
import filetypes from 'davros/lib/filetypes';
import filetypeIcons from 'davros/lib/filetype-icons';
import Webdav from 'davros/mixins/webdav';

export default EmberObject.extend(Webdav, {
  path: null, // file's path within the dav server, excluding the dav base
  size: null, // in bytes
  mtime: null, // modified time
  files: null, // if a directory, a list of children

  name: computed('path', function() {
    return this.path.split(/[\\/]/).pop();
  }),

  sortedFiles: computed('files', function() {
    return this.files.sortBy('isFile', 'name');
  }),

  lotsOfFiles: computed('files.length', function() {
    return this.get('files.length') > 50;
  }),

  parent: computed('path', function() {
    return this.path.replace(/\/?[^/]*\/?$/, '');
  }),

  linkedPath: computed('path', 'isDirectory', function() {
    if (this.isDirectory) {
      return this.path + '/';
    } else {
      return this.path;
    }
  }),

  isDirectory: false,

  isFile: computed('isDirectory', function() {
    return !this.isDirectory;
  }),

  extension: computed('name', function() {
    var pieces = this.name.split('.');
    if (pieces.length > 1) {
      return pieces[pieces.length - 1];
    } else {
      return '';
    }
  }),

  width: computed('dimensions', function() {
    return this.dimensions[0];
  }),

  height: computed('dimensions', function() {
    return this.dimensions[1];
  }),

  type: computed('extension', function() {
    return filetypes[this.extension.toLowerCase()] || filetypes.defaultType;
  }),

  typeIcon: computed('type', function() {
    return filetypeIcons[this.type];
  }),

  typeComponent: computed('type', function() {
    return `files/type-${this.type}`;
  }),

  rawPath: computed('path', 'davBase', function() {
    return [this.davBase, this.path].join('/');
  })
});
