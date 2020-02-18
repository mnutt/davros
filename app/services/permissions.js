import Service from '@ember/service';
import fetch from 'ember-network/fetch';

export default Service.extend({
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
    if(this.error) { return true; } // fail safe in case permissions not available
    return this.list.indexOf(permission) >= 0;
  }
});
