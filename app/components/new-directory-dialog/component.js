import Ember from 'ember';

export default Ember.Component.extend({
  directoryName: '',
  isValid: false,
  isInvalid: Ember.computed.not('isValid'),

  directoryValidation: [{
    message: 'Directory name is not valid.',
    validate: (name) => {
      return name.match(/^[^\\/?%*:|"<>\.]+$/);
    }
  }],

  actions: {
    close() {
      this.set('directoryName', '');
      this.set('active', false);
    },

    create(directoryName) {
      let defer = Ember.RSVP.defer();
      this.sendAction('onCreate', directoryName, defer);

      defer.promise.then(() => {
        this.send('close');
      });
    }
  }
});
