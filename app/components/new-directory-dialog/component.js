import Ember from 'ember';

const { get, set, computed } = Ember;

export default Ember.Component.extend({
  directoryName: '',
  isValid: false,
  isInvalid: computed.not('isValid'),

  directoryValidation: [{
    message: 'Directory name is not valid.',
    validate: (name) => {
      return name.match(/^[^\\/?%*:|"<>\.]+$/);
    }
  }],

  actions: {
    close() {
      set(this, 'directoryName', '');
      set(this, 'active', false);
    },

    create(directoryName) {
      if(get(this, 'isInvalid')) { return; }

      let defer = Ember.RSVP.defer();
      this.sendAction('onCreate', directoryName, defer);

      defer.promise.then(() => {
        this.send('close');
      });
    }
  }
});
