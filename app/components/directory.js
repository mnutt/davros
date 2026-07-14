import { service } from '@ember/service';
import FileComponent from './file';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { trackedSet } from '@ember/reactive/collections';
import { registerDestructor } from '@ember/destroyable';

export default class DirectoryComponent extends FileComponent {
  @tracked newDialogActive = false;
  @tracked moveDialogActive = false;
  @tracked deleteDialogActive = false;
  @tracked renameDialogActive = false;
  @tracked isSelecting;
  @tracked slideshowActive = false;
  @tracked slideshowIndex = 0;
  selectedFiles = trackedSet();

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
    return [...this.selectedFiles]
      .map((path) => files.find((f) => f.path === path))
      .filter(Boolean)
      .map((file) => file.name);
  }

  get directoryGalleryItems() {
    return this.model.sortedFiles
      .filter((file) => {
        return file.type === 'image';
      })
      .map((file) => {
        return { src: file.rawPath, title: file.name };
      });
  }

  get currentSlide() {
    return this.directoryGalleryItems[this.slideshowIndex];
  }

  get previousSlideItem() {
    const items = this.directoryGalleryItems;
    if (!items.length) {
      return null;
    }

    return items[(this.slideshowIndex - 1 + items.length) % items.length];
  }

  get nextSlideItem() {
    const items = this.directoryGalleryItems;
    if (!items.length) {
      return null;
    }

    return items[(this.slideshowIndex + 1) % items.length];
  }

  get currentSlideNumber() {
    return this.slideshowIndex + 1;
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
  openSlideshow(index = 0) {
    if (!this.directoryGalleryItems.length) {
      return;
    }

    const normalizedIndex = Number.isInteger(index) ? index : 0;
    this.slideshowIndex = Math.min(Math.max(normalizedIndex, 0), this.directoryGalleryItems.length - 1);
    this.slideshowActive = true;
  }

  @action
  closeSlideshow() {
    this.slideshowActive = false;
  }

  @action
  setSlideshowIndex(index) {
    const maxIndex = this.directoryGalleryItems.length - 1;
    this.slideshowIndex = Math.min(Math.max(index, 0), maxIndex);
  }

  @action
  focusSlideshow(element) {
    element.focus();
  }

  @action
  nextSlide() {
    const itemCount = this.directoryGalleryItems.length;
    if (!itemCount) {
      return;
    }

    this.slideshowIndex = (this.slideshowIndex + 1) % itemCount;
  }

  @action
  previousSlide() {
    const itemCount = this.directoryGalleryItems.length;
    if (!itemCount) {
      return;
    }

    this.slideshowIndex = (this.slideshowIndex - 1 + itemCount) % itemCount;
  }

  @action
  toggleSelectFromMenu() {
    this.closeMobileMenu();
    this.toggleSelectCheckboxes();
  }

  @action
  chooseUploadFromMenu() {
    this.closeMobileMenu();
    this.chooseUpload();
  }

  @action
  openNewDialogFromMenu() {
    this.closeMobileMenu();
    this.newDialogActive = true;
  }

  @action
  openSlideshowFromMenu() {
    this.closeMobileMenu();
    this.openSlideshow();
  }

  @action
  downloadDirectoryFromMenu() {
    this.closeMobileMenu();
    this.downloadDirectory();
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
  onFileClick(file, event) {
    event.preventDefault();
    event.stopPropagation();
    this.router.transitionTo('file', file.linkedPath);
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

  @action
  closeNewDialog() {
    this.newDialogActive = false;
  }

  @action
  closeMoveDialog() {
    this.moveDialogActive = false;
  }

  @action
  closeDeleteDialog() {
    this.deleteDialogActive = false;
  }

  @action
  closeRenameDialog() {
    this.renameDialogActive = false;
  }
}
