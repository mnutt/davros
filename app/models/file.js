import filetypes from 'davros/lib/filetypes';
import filetypeIcons from 'davros/lib/filetype-icons';
import DavClient from 'davros/lib/webdav';
import fetch from 'fetch';
import { tracked } from '@glimmer/tracking';
import ensureCollectionExists from 'davros/lib/ensure-collection-exists';

export const base = '/dav';
const client = new DavClient(base);

export default class File {
  @tracked path; // file's path within the dav server, excluding the dav base
  @tracked size; // in bytes
  @tracked mtime; // modified time
  @tracked files = []; // if a directory, a list of children
  @tracked isDirectory = false;
  @tracked dimensions = [0, 0];

  constructor(attrs = {}) {
    Object.assign(this, attrs);
  }

  static ensureCollectionExists(path) {
    return ensureCollectionExists(path, client);
  }

  static async load(path) {
    const items = await client.load(path);

    const file = new File(items.shift());
    await file.setPropertiesFromItems(items);

    return file;
  }

  async reload() {
    const items = await client.load(this.path);
    Object.assign(this, items.shift());

    await this.setPropertiesFromItems(items);
  }

  async setPropertiesFromItems(items) {
    if (items.length > 0) {
      this.loadChildren(items);
    }

    if (this.type === 'markdown' || this.type === 'code') {
      try {
        const previewResponse = await fetch(this.rawPath);
        this.previewContent = await previewResponse.text();
      } catch (e) {
        this.previewFailed = true;
      }
    } else if (this.type === 'document') {
      try {
        const previewResponse = await fetch(this.documentPreviewUrl);
        this.previewContent = await previewResponse.text();

        if (!this.previewContent.length) {
          this.previewFailed = true;
        }
      } catch (e) {
        this.previewFailed = true;
      }
    }
  }

  get name() {
    return decodeURIComponent(this.path.split(/[\\/]/).pop());
  }

  get sortedFiles() {
    return this.files.sortBy('isFile', 'name');
  }

  get lotsOfFiles() {
    return this.files.length > 50;
  }

  get parent() {
    return this.path.replace(/\/?[^/]*\/?$/, '');
  }

  get linkedPath() {
    if (this.isDirectory) {
      return this.path + '/';
    } else {
      return this.path;
    }
  }

  get isFile() {
    return !this.isDirectory;
  }

  get extension() {
    const pieces = this.name.split('.');
    if (pieces.length > 1) {
      return pieces[pieces.length - 1];
    } else {
      return '';
    }
  }

  get width() {
    return this.dimensions ? this.dimensions[0] : 0;
  }

  get height() {
    return this.dimensions ? this.dimensions[1] : 0;
  }

  get type() {
    return filetypes[this.extension.toLowerCase()] || filetypes.defaultType;
  }

  get typeIcon() {
    return filetypeIcons[this.type];
  }

  get typeComponent() {
    return `files/type-${this.type}`;
  }

  get rawPath() {
    return client.fullPath(this.path);
  }

  get documentPreviewUrl() {
    const params = new URLSearchParams({
      url: this.rawPath,
      ts: this.mtime.getTime(),
    }).toString();

    return `/api/preview?${params}`;
  }

  remove() {
    return client.remove(this.path);
  }

  move(destinationDir) {
    if (this.path === destinationDir) {
      throw new Error('Cannot copy a directory to itself');
    }

    if (this.parent === destinationDir) {
      throw new Error('Cannot move files to their own directory');
    }

    return client.move(this.path, [destinationDir, this.name].join('/'));
  }

  rename(newName) {
    return client.move(this.path, [this.parent, newName].join('/'));
  }

  loadFromResponse(response) {
    Object.assign(this, response);
  }

  loadChildren(parsedResponses) {
    this.files = parsedResponses.map((response) => new File(response));
  }
}
