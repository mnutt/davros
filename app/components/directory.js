import { inject as service } from '@ember/service';
import FileComponent from './file';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';

const galleryOptions = { hideShare: true };

export default class DirectoryComponent extends FileComponent {
  @tracked newDialogActive = false;
  @tracked moveDialogActive = false;
  @tracked deleteDialogActive = false;
  @tracked renameDialogActive = false;
  @tracked isSelecting;
  @tracked galleryEnabled = false;
  selectedFiles = tracked(Set);

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
  openDialog(dialog) {
    if (dialog === 'delete') {
      this.deleteDialogActive = true;
    } else if (dialog === 'move') {
      this.moveDialogActive = true;
    } else if (dialog === 'rename') {
      this.renameDialogActive = true;
    }
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

  @action
  async finishModal() {
    this.selectedFiles.clear();
    await this.model.reload();
    this.moveDialogActive = false;
    this.deleteDialogActive = false;
    this.renameDialogActive = false;
  }

  @action
  toggleSelectCheckboxes() {
    this.isSelecting = !this.isSelecting;
    if (this.isSelecting) {
      this.showExtraFields = false;
    }
  }
}
