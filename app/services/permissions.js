import Ember from 'ember';
import fetch from 'ember-network/fetch';

export default Ember.Service.extend({
  list: [],
  error: false,

  init: function() {
    fetch("/api/permissions").then((response) => {
      return response.json();
    }).then((result) => {
      this.set('list', result.permissions);
    }).catch((err) => {
      this.set('error', err);
      this.set('list', []);
    });
  },

  can: function(permission) {
    if(this.get('error')) { return true; } // fail safe in case permissions not available
    return this.get('list').indexOf(permission) >= 0;
  }
});
