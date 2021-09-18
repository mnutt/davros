import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';

export default class DirectoryListingComponent extends Component {
  @tracked showExtraFields = true;
  @tracked lastSelectedFile;
  @tracked dragOverPath;
  @tracked progressPercent = null;
  @tracked progressCount = null;

  // Default action on link click is to just follow the link
  k() {}

  get selectedFiles() {
    return this.args.selectedFiles || new Set();
  }

  get allFilesSelected() {
    return this.selectedFiles.size >= this.args.model.files.length;
  }

  get someFilesSelected() {
    return this.selectedFiles.size > 0 && this.selectedFiles.size < this.args.model.files.length;
  }

  get onClick() {
    return this.args.onClick || this.k;
  }

  get selectedFilesDescription() {
    if (this.selectedFiles.size === 0) {
      return '';
    }

    const firstName = this.selectedFiles.values().next().value.name;

    if (this.selectedFiles.size === 1) {
      return firstName;
    } else {
      const others = this.selectedFiles.size > 2 ? 'other files' : 'other file';
      return [firstName, '&', this.selectedFiles.size - 1, others].join(' ');
    }
  }

  async moveSelectedFiles(destination) {
    const files = this.selectedFiles.values();

    this.progressPercent = 0.01;
    this.progressCount = 0;
    const failures = [];

    for (let file of files) {
      const response = await file.move(destination);
      if (!response.ok) {
        failures.push(file.name);
      }
      this.progressPercent = (++this.progressCount / this.selectedFiles.size) * 100;
    }

    this.progressPercent = null;
    this.progressCount = null;

    if (failures.length) {
      let message = `Could not move ${failures.shift()}`;
      if (failures.length) {
        message += ` and ${failures.length} other${failures.length > 1 ? 's' : ''}`;
      }
      this.errors.setError(message);
    }
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
    const { sortedFiles } = this.args.model;
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
    const { files } = this.args.model;

    if (checked) {
      for (let file of files) {
        this.selectedFiles.add(file);
      }
    } else {
      this.selectedFiles.clear();
    }
  }

  @action
  dragStart(event) {
    const draggable = event.target && event.target.getAttribute('draggable');

    if (!draggable) {
      event.preventDefault();
      return;
    }

    const files = [...this.selectedFiles].map((f) => f.path);

    const ghost = document.querySelector('.drag-ghost');
    ghost.querySelector('span').innerText = this.selectedFilesDescription;

    event.dataTransfer.setDragImage(ghost, 0, 0);
    event.dataTransfer.setData('text/plain', files.join('\n'));
    event.dataTransfer.dropEffect = 'move';
  }

  @action
  dragEnd(event) {
    document.querySelector('.drag-ghost').classList.add('hidden');

    const { dataTransfer } = event;

    // canceled
    if (dataTransfer.dropEffect === 'none' || !this.dragOverPath) {
      return;
    }

    if (event.altKey) {
      this.copySelectedFiles(this.dragOverPath);
    } else {
      this.moveSelectedFiles(this.dragOverPath);
    }

    this.dragOverPath = null;
  }

  @action
  dragEnter(event) {
    const target = event.target && event.target.closest('[data-droppable=true]');
    if (target) {
      this.dragOverPath = target.getAttribute('data-file-path');
    }
  }

  @action
  dragLeave(event) {
    const target = event.target && event.target.closest('[data-droppable=true]');
    if (event.target && event.target !== target) {
      return;
    }

    if (this.dragOverPath === event.target.getAttribute('data-file-path')) {
      this.dragOverPath = null;
    }
  }
}
