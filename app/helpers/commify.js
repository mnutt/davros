import Ember from 'ember';

export default Ember.Helper.helper(function(value) {
  if (typeof value === 'undefined') {
    return null;
  }

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});
