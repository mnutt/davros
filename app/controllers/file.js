import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
import GalleryPlugin from '../mixins/directory/gallery';

export default Controller.extend(GalleryPlugin, {
  showExtraFields: true,
  newDialogActive: false,
  deleteDialogActive: false,

  permissions: service(),
  publishing: service(),

  isRoot: function() {
    return this.get('model.path') === '';
  }.property('model.path'),

  publicUrl: computed('model.path', 'publishing.urlBase', function() {
    let urlBase = get(this, 'publishing.urlBase');
    if(!urlBase) { return null; }

    return [urlBase, get(this, 'model.path')].join('/');
  }),

  canEdit: function() {
    return this.permissions.can('edit');
  }.property('permissions.list')
});
