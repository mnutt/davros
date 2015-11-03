import Ember from 'ember';

export default Ember.Controller.extend({
  permissions: Ember.inject.service(),

  canSync: function() {
    return this.get('permissions').can('edit');
  }.property('permissions.list')
});
