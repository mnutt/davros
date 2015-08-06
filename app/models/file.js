import DS from 'ember-data';

export default DS.Model.extend({
  mode: DS.attr('number'),
  path: DS.attr('string'),
  size: DS.attr('number'),
  name: DS.attr('string'),
  files: DS.hasMany('files', {async: true}),

  parent: function() {
    var parentDir = this.get('path').replace(/[^\/]*\/?$/, '');
    if(parentDir === "") {
      return "/";
    }
    return parentDir;
  }.property('path'),

  isDirectory: function() {
    return this.get('mode') === 16877;
  }.property('mode')
});
