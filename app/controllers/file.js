import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get } from '@ember/object';

const galleryOptions = { hideShare: true };

export default Controller.extend({
  showExtraFields: true,
  newDialogActive: false,
  deleteDialogActive: false,
  galleryEnabled: false,

  permissions: service(),
  publishing: service(),

  directoryGalleryItems: computed('model.sortedFiles', function() {
    return this.model.sortedFiles
      .filter(file => {
        return file.type === 'image';
      })
      .map(file => {
        return { src: file.rawPath, title: file.name, w: file.width, h: file.height };
      });
  }),

  galleryOptions() {
    return galleryOptions;
  },

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
