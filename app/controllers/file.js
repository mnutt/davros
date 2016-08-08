import Ember from 'ember';
import GalleryPlugin from '../mixins/directory/gallery';

export default Ember.Controller.extend(GalleryPlugin, {
  showExtraFields: true,

  permissions: Ember.inject.service(),

  canEdit: function() {
    return this.get('permissions').can('edit');
  }.property('permissions.list')
});
