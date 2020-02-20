import Service from '@ember/service';
import fetch from 'fetch';

function isIframed() {
  return window.top !== window;
}

export default Service.extend({
  list: [],
  error: false,

  init: function() {
    this._super.apply(this, arguments);

    if (!isIframed()) {
      this.set('list', ['read', 'edit']);
      return;
    }

    fetch('/api/permissions')
      .then(response => {
        return response.json();
      })
      .then(result => {
        this.set('list', result.permissions);
      })
      .catch(err => {
        this.set('error', err);
        this.set('list', []);
      });
  },

  can: function(permission) {
    if (this.error) {
      return true;
    } // fail safe in case permissions not available
    return this.list.indexOf(permission) >= 0;
  }
});
