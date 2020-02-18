import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  permissions: service(),

  canEdit: function() {
    return this.permissions.can('edit');
  }.property('permissions.list'),

  canSync: function() {
    return this.permissions.can('edit');
  }.property('permissions.list')
});
