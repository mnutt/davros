import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { computed, get } from '@ember/object';

const apexValidation = [
  {
    message: 'Apex domains (without www) will not work as well',
    validate: input => !input.match(/^\w+\.\w?\w?\w?\w?$/)
  }
];

export default Controller.extend({
  publishing: service(),
  domain: '',

  apexValidation() {
    return apexValidation;
  },

  unsavedDomainIsApex: computed('domain', function() {
    return !!get(this, 'domain');
  }),

  domainIsApex: computed('publishing.domain', function() {
    return !!get(this, 'publishing.domain').match(/^\w+\.\w?\w?\w?\w?$/);
  })
});
