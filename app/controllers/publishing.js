import Ember from 'ember';

export default Ember.Controller.extend({
  domain: '',

  domainSet: function() {
    return this.get('domain') !== '';
  }.property('domain')
});
