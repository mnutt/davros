import { inject as service } from '@ember/service';
import FileComponent from './file';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';

const galleryOptions = { hideShare: true };

export default class DirectoryComponent extends FileComponent {
  @tracked showExtraFields = true;
  @tracked newDialogActive = false;
  galleryEnabled = false;
  selectedFiles = tracked(Set);
  @tracked lastSelectedFile;
  @tracked isSelecting;

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

  get allFilesSelected() {
    return this.selectedFiles.size >= this.model.files.length;
  }

  get someFilesSelected() {
    return this.selectedFiles.size > 0 && this.selectedFiles.size < this.model.files.length;
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
  toggleSelect(file, event) {
    const { checked } = event.target;
    checked ? this.selectedFiles.add(file) : this.selectedFiles.delete(file);
  }

  @action
  toggleShiftSelect(file, event) {
    const last = this.lastSelectedFile;
    this.lastSelectedFile = file;
    if (!last) {
      return;
    }

    if (!event.shiftKey) {
      return;
    }

    const { checked } = event.target;
    const { sortedFiles } = this.model;
    const lastIndex = sortedFiles.indexOf(last);
    const thisIndex = sortedFiles.indexOf(file);

    if (lastIndex >= 0 && thisIndex >= 0) {
      const range = sortedFiles.slice(
        Math.min(lastIndex, thisIndex),
        Math.max(lastIndex, thisIndex)
      );

      for (let file of range) {
        checked ? this.selectedFiles.add(file) : this.selectedFiles.delete(file);
      }
      checked ? this.selectedFiles.add(last) : this.selectedFiles.delete(last);
    }
  }

  @action
  toggleSelectAll(event) {
    const { checked } = event.target;
    const { files } = this.model;

    if (checked) {
      for (let file of files) {
        this.selectedFiles.add(file);
      }
    } else {
      this.selectedFiles.clear();
    }
  }

  @action
  async deleteSelected() {
    for (let file of [...this.selectedFiles]) {
      await file.remove();
    }

    await this.model.reload();
    this.selectedFiles.clear();
  }

  @action
  toggleSelectCheckboxes() {
    this.isSelecting = !this.isSelecting;
    if (this.isSelecting) {
      this.showExtraFields = false;
    }
  }
}
