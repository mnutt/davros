import Ember from 'ember';

export default Ember.Component.extend({
  what: 'this directory',

  actions: {
    close() {
      this.set('active', false);
    },

    delete() {
      let defer = Ember.RSVP.defer();
      this.sendAction('onDelete', defer);

      defer.promise.then(() => {
        this.send('close');
      });
    }
  }
});
