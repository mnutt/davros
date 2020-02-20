import { defer } from 'rsvp';
import Component from '@ember/component';
import { set, get } from '@ember/object';

export default Component.extend({
  directoryName: '',

  directoryValidation: [
    {
      message: 'Directory name is not valid.',
      validate: name => {
        return name.match(/^[^\\/?%*:|"<>.]+$/);
      }
    }
  ],

  actions: {
    close() {
      set(this, 'directoryName', '');
      set(this, 'active', false);
    },

    create() {
      let directoryName = get(this, 'directoryName');

      let _defer = defer();
      this.sendAction('onCreate', directoryName, _defer);

      _defer.promise.then(() => {
        this.send('close');
      });
    }
  }
});
