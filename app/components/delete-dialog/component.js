import { defer } from 'rsvp';
import Component from '@ember/component';

export default Component.extend({
  what: 'this directory',

  actions: {
    close() {
      this.set('active', false);
    },

    delete() {
      let _defer = defer();
      this.sendAction('onDelete', _defer);

      _defer.promise.then(() => {
        this.send('close');
      });
    }
  }
});
