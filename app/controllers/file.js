import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get } from '@ember/object';

import { action } from '@ember/object';

const galleryOptions = { hideShare: true };

export default class FileController extends Controller {
  showExtraFields = true;
  newDialogActive = false;
  deleteDialogActive = false;
  galleryEnabled = false;

  @service permissions;
  @service publishing;

  @computed('model.sortedFiles')
  get directoryGalleryItems() {
    return this.model.sortedFiles
      .filter(file => {
        return file.type === 'image';
      })
      .map(file => {
        return { src: file.rawPath, title: file.name, w: file.width, h: file.height };
      });
  }

  galleryOptions() {
    return galleryOptions;
  }

  @computed('model.path')
  get isRoot() {
    return this.get('model.path') === '';
  }

  @computed('model.path', 'publish.urlBase')
  get publicUrl() {
    let urlBase = get(this, 'publishing.urlBase');
    if (!urlBase) {
      return null;
    }

    return [urlBase, get(this, 'model.path')].join('/');
  }

  @computed('permissions.list')
  get canEdit() {
    return this.permissions.can('edit');
  }

  @action
  chooseUpload() {
    document.querySelector('.upload-placeholder').click();
  }

  @action
  downloadDirectory() {
    const { path } = this.model;
    const endpoint = `/api/archive?path=${encodeURIComponent(path)}`;
    document.location.href = endpoint;
  }
}
