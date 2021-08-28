import { inject as service } from '@ember/service';
import FileComponent from './file';
import { action } from '@ember/object';

const galleryOptions = { hideShare: true };

export default class DirectoryComponent extends FileComponent {
  showExtraFields = true;
  newDialogActive = false;
  galleryEnabled = false;

  @service permissions;
  @service publishing;

  get directoryGalleryItems() {
    return this.model.sortedFiles
      .filter((file) => {
        return file.type === 'image';
      })
      .map((file) => {
        return { src: file.rawPath, title: file.name, w: file.width, h: file.height };
      });
  }

  galleryOptions() {
    return galleryOptions;
  }

  get isRoot() {
    return this.model.path === '';
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

  @action
  reload() {
    this.model.reload();
  }
}
