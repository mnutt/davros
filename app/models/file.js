import DS from 'ember-data';
import filetypes from 'davros/lib/filetypes';
import filetypeIcons from 'davros/lib/filetype-icons';

export default DS.Model.extend({
  mode: DS.attr('number'),
  path: DS.attr('string'),
  size: DS.attr('number'),
  name: DS.attr('string'),
  ctime: DS.attr('date'),
  mtime: DS.attr('date'),
  files: DS.hasMany('files', {async: true}),

  sortedFiles: function() {
    return this.get('files').sortBy('mode', 'name');
  }.property('files'),

  davBase: '/remote.php/webdav',

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

  isDirectory: function() {
    // "0040000" in octal is the bitmask for a directory
    return (this.get('mode') & parseInt("0040000", 8)) > 0;
  }.property('mode'),

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
