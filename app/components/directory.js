import { inject as service } from '@ember/service';
import FileComponent from './file';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { registerDestructor } from '@ember/destroyable';

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

  constructor(owner, args) {
    super(owner, args);

    this.setupModelReloadListener();
  }

  setupModelReloadListener() {
    const { model } = this.args;

    model.on('reload', this, this.unselectDeletedFiles);

    registerDestructor(this, () => {
      model.off('reload', this, this.unselectDeletedFiles);
    });
  }

  unselectDeletedFiles() {
    const paths = [...this.selectedFiles];

    for (let path of paths) {
      if (!this.args.model.files.find((f) => f.path === path)) {
        this.selectedFiles.delete(path);
      }
    }
  }

  get selectedFileList() {
    const { files } = this.args.model;
    return [...this.selectedFiles].map((path) => files.find((f) => f.path === path).name);
  }

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
