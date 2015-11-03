import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Service.extend({
  list: [],

  init: function() {
    ajax("/api/permissions").then((result) => {
      this.set('list', result.permissions);
    });
  },

  can: function(permission) {
    return this.get('list').indexOf(permission) >= 0;
  }
});
