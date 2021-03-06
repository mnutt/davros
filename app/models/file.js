import filetypes from 'davros/lib/filetypes';
import filetypeIcons from 'davros/lib/filetype-icons';
import DavClient from 'davros/lib/webdav';
import fetch from 'fetch';
import { tracked } from '@glimmer/tracking';
import ensureCollectionExists from 'davros/lib/ensure-collection-exists';

export const base = '/remote.php/webdav';
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

    if (items.length > 0) {
      file.loadChildren(items);
    }

    if (file.type === 'markdown' || file.type === 'code') {
      try {
        const previewResponse = await fetch(file.rawPath);
        file.previewContent = await previewResponse.text();
      } catch (e) {
        file.previewFailed = true;
      }
    } else if (file.type === 'document') {
      try {
        const previewResponse = await fetch(file.documentPreviewUrl());
        file.previewContent = await previewResponse.text();

        if (!file.previewContent.length) {
          file.previewFailed = true;
        }
      } catch (e) {
        file.previewFailed = true;
      }
    }

    return file;
  }

  get name() {
    return this.path.split(/[\\/]/).pop();
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
    return this.dimensions[0];
  }

  get height() {
    return this.dimensions[1];
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
      ts: this.mtime.getTime()
    }).toString();

    return `/api/preview?${params}`;
  }

  remove() {
    return client.remove(this.path);
  }

  loadFromResponse(response) {
    Object.assign(this, response);
  }

  loadChildren(parsedResponses) {
    this.files = parsedResponses.map(response => new File(response));
  }
}
