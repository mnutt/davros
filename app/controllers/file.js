import Ember from 'ember';
import GalleryPlugin from '../mixins/directory/gallery';

export default Ember.Controller.extend(GalleryPlugin, {
  showExtraFields: true,
  newDialogActive: false,
  deleteDialogActive: false,

  permissions: Ember.inject.service(),

  isRoot: function() {
    return this.get('model.path') === '';
  }.property('model.path'),

  canEdit: function() {
    return this.get('permissions').can('edit');
  }.property('permissions.list')
});
