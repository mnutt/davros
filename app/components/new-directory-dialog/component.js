import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Component.extend({
  directoryName: '',

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

    create() {
      let directoryName = get(this, 'directoryName');

      let defer = Ember.RSVP.defer();
      this.sendAction('onCreate', directoryName, defer);

      defer.promise.then(() => {
        this.send('close');
      });
    }
  }
});
