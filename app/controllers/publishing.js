import Ember from 'ember';

export default Ember.Controller.extend({
  domain: '',

  domainSet: function() {
    return this.get('domain') !== '';
  }.property('domain'),

  domainIsApex: function() {
    return !!this.get('domain').match(/^\w+\.\w?\w?\w?\w?$/);
  }.property('domain')
});
