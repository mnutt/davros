import Ember from 'ember';
import GalleryPlugin from '../mixins/directory/gallery';

const { get, computed, inject } = Ember;

export default Ember.Controller.extend(GalleryPlugin, {
  showExtraFields: true,
  newDialogActive: false,
  deleteDialogActive: false,

  permissions: inject.service(),
  publishing: inject.service(),

  isRoot: function() {
    return this.get('model.path') === '';
  }.property('model.path'),

  publicUrl: computed('model.path', 'publishing.urlBase', function() {
    let urlBase = get(this, 'publishing.urlBase');
    if(!urlBase) { return null; }

    return [urlBase, get(this, 'model.path')].join('/');
  }),

  canEdit: function() {
    return this.get('permissions').can('edit');
  }.property('permissions.list')
});
