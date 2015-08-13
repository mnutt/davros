import DS from 'ember-data';
import filetypes from 'davros/lib/filetypes';

export default DS.Model.extend({
  mode: DS.attr('number'),
  path: DS.attr('string'),
  size: DS.attr('number'),
  name: DS.attr('string'),
  files: DS.hasMany('files', {async: true}),

  sortedFiles: function() {
    return this.get('files').sortBy('mode', 'name');
  }.property('files'),

  davBase: '/remote.php/webdav',

  parent: function() {
    return this.get('path').replace(/\/?[^\/]*\/?$/, '');
  }.property('path'),

  isDirectory: function() {
    return this.get('mode') === 16877;
  }.property('mode'),

  extension: function() {
    var pieces = this.get('name').split('.');
    return pieces[pieces.length - 1];
  }.property('name'),

  type: function() {
    return filetypes[this.get('extension')] || filetypes.defaultType;
  }.property('extension'),

  rawPath: function() {
    return [this.get('davBase'), this.get('path')].join('/');
  }.property('path', 'davBase')
});
