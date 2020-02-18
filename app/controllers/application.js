import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  permissions: service(),

  canEdit: computed('permissions.list', function() {
    return this.permissions.can('edit');
  }),

  canSync: computed('permissions.list', function() {
    return this.permissions.can('edit');
  })
});
