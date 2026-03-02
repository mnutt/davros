import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import File from '../models/file';

export default class DavrosUploader extends Component {
  @service router;
  @tracked isDropActive = false;
  @tracked totalUploads = 0;
  @tracked completedUploads = 0;
  dragDepth = 0;
  boundDragEnter = (event) => this.onDragEnter(event);
  boundDragOver = (event) => this.onDragOver(event);
  boundDragLeave = (event) => this.onDragLeave(event);
  boundDrop = (event) => this.onDrop(event);

  get uploadLocation() {
    let location = new URL(this.router.currentURL, 'http://localhost').pathname;

    if (location.startsWith('/files')) {
      location = location.replace(/^\/files/, '');

      if (!location.endsWith('/')) {
        // dirname of current path, so if path is /foo/README, use /foo/
        location = location.replace(/\/[^/]*$/, '');
      }

      location = location.replace(/^\//, '').replace(/\/$/, '');
    } else {
      // otherwise, upload files in the root directory
      // (this shouldn't happen anymore)
      location = '';
    }

    return location;
  }

  get uploadProgress() {
    if (this.totalUploads === 0) {
      return 0;
    }

    return (this.completedUploads / this.totalUploads) * 100;
  }

  get hasUploadsInProgress() {
    return this.totalUploads > 0;
  }

  hasDroppedFiles(dataTransfer) {
    if (!dataTransfer) {
      return false;
    }

    const types = Array.from(dataTransfer.types || []);
    if (types.includes('Files')) {
      return true;
    }

    const items = Array.from(dataTransfer.items || []);
    return items.some((item) => item.kind === 'file');
  }

  @action
  setupWindowDragEvents() {
    window.addEventListener('dragenter', this.boundDragEnter);
    window.addEventListener('dragover', this.boundDragOver);
    window.addEventListener('dragleave', this.boundDragLeave);
    window.addEventListener('drop', this.boundDrop);
  }

  @action
  teardownWindowDragEvents() {
    window.removeEventListener('dragenter', this.boundDragEnter);
    window.removeEventListener('dragover', this.boundDragOver);
    window.removeEventListener('dragleave', this.boundDragLeave);
    window.removeEventListener('drop', this.boundDrop);
  }

  uploadFile = task({ maxConcurrency: 5, enqueue: true }, async (upload) => {
    const nativeFile = upload.file;
    if (!nativeFile?.name) {
      return;
    }

    let path = upload.fullPath || nativeFile.webkitRelativePath || nativeFile.name;
    path = encodeURIComponent(path);

    if (path[0] !== '/') {
      path = '/' + path;
    }

    const locationPrefix = this.uploadLocation ? `/${this.uploadLocation}` : '';
    const fullPath = `${locationPrefix}${path}`;

    await File.ensureCollectionExists(fullPath);
    await this.uploadNativeFile(nativeFile, fullPath);
    this.completedUploads++;
  });

  async uploadNativeFile(file, destination) {
    const response = await fetch(`/dav${destination}`, {
      method: 'PUT',
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
  }

  async runUploads(uploads) {
    this.totalUploads = uploads.length;
    this.completedUploads = 0;

    try {
      await Promise.all(uploads.map((upload) => this.uploadFile.perform(upload)));
    } finally {
      this.totalUploads = 0;
      this.completedUploads = 0;
    }
  }

  @action onDragEnter(event) {
    if (!this.hasDroppedFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    this.dragDepth++;
    this.isDropActive = true;
  }

  @action onDragOver(event) {
    if (!this.hasDroppedFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
  }

  @action onDragLeave(event) {
    if (!this.hasDroppedFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) {
      this.isDropActive = false;
    }
  }

  @action
  async onDrop(event) {
    if (!this.hasDroppedFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    this.dragDepth = 0;
    this.isDropActive = false;

    const uploads = await this.extractUploadsFromDrop(event.dataTransfer);
    if (!uploads.length) {
      return;
    }

    await this.runUploads(uploads);
  }

  async extractUploadsFromDrop(dataTransfer) {
    const items = Array.from(dataTransfer?.items || []);
    if (!items.length || !items.some((item) => typeof item.webkitGetAsEntry === 'function')) {
      return Array.from(dataTransfer?.files || []).map((file) => ({
        file,
        fullPath: file.webkitRelativePath || file.name,
      }));
    }

    const uploads = [];
    await Promise.all(
      items.map(async (item) => {
        const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
        if (entry) {
          await this.walkEntry(entry, '', uploads);
        }
      })
    );
    return uploads;
  }

  async walkEntry(entry, parentPath, uploads) {
    if (entry.isFile) {
      const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
      uploads.push({
        file,
        fullPath: parentPath ? `${parentPath}/${file.name}` : file.name,
      });
      return;
    }

    if (!entry.isDirectory) {
      return;
    }

    const nextParent = parentPath ? `${parentPath}/${entry.name}` : entry.name;
    const reader = entry.createReader();
    let batch = await this.readEntries(reader);

    while (batch.length > 0) {
      for (const child of batch) {
        await this.walkEntry(child, nextParent, uploads);
      }
      batch = await this.readEntries(reader);
    }
  }

  readEntries(reader) {
    return new Promise((resolve, reject) => reader.readEntries(resolve, reject));
  }

  @action
  async selectFiles(event) {
    const uploads = Array.from(event.target.files || []).map((file) => ({
      file,
      fullPath: file.webkitRelativePath || file.name,
    }));
    event.target.value = '';
    await this.runUploads(uploads);
  }
}
