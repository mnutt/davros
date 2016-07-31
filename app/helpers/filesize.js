import Ember from 'ember';

export default Ember.Helper.helper(function(value) {
  if (typeof value === 'undefined') {
    return null;
  }
  var i,
      filesize,
      units = ['B', 'KB', 'MB', 'GB', 'TB'];
  for (i = 0; i < units.length; i++) {
    if (value < 1024) {
      var unitValue = '<span>' + units[i] + '</span>';
      return new Ember.String.htmlSafe(Math.floor(value) + unitValue);
    }
    value = value / 1024;
  }
  return filesize;
});
