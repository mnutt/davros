import Ember from 'ember';

const { get, computed, inject } = Ember;

export default Ember.Controller.extend({
  publishing: inject.service(),
  domain: '',

  apexValidation: [{
    message: "Apex domains (without www) will not work as well",
    validate: (input) => !input.match(/^\w+\.\w?\w?\w?\w?$/)
  }],

  unsavedDomainIsApex: computed('domain', function() {
    return !!get(this, 'domain');
  }),

  domainIsApex: computed('publishing.domain', function() {
    return !!get(this, 'publishing.domain').match(/^\w+\.\w?\w?\w?\w?$/);
  })
});
