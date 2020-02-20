import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get } from '@ember/object';
import GalleryPlugin from '../mixins/directory/gallery';

export default Controller.extend(GalleryPlugin, {
  showExtraFields: true,
  newDialogActive: false,
  deleteDialogActive: false,

  permissions: service(),
  publishing: service(),

  isRoot: computed('model.path', function() {
    return this.get('model.path') === '';
  }),

  publicUrl: computed('model.path', 'publishing.urlBase', function() {
    let urlBase = get(this, 'publishing.urlBase');
    if (!urlBase) {
      return null;
    }

    return [urlBase, get(this, 'model.path')].join('/');
  }),

  canEdit: computed('permissions.list', function() {
    return this.permissions.can('edit');
  }),

  chooseUpload() {
    document.querySelector('.upload-placeholder').click();
  }
});
