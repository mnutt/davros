import filetypes from '../lib/filetypes';
import filetypeIcons from '../lib/filetype-icons';
import DavClient from '../lib/webdav';
import { tracked } from '@glimmer/tracking';
import ensureCollectionExists from '../lib/ensure-collection-exists';
import { addListener, removeListener, sendEvent } from '@ember/object/events';

export const base = '/dav';
const client = new DavClient(base);

async function pdfBlobFromResponse(response) {
  const body = await response.arrayBuffer();
  return new Blob([body], { type: 'application/pdf' });
}

export default class File {
  @tracked path; // file's path within the dav server, excluding the dav base
  @tracked size; // in bytes
  @tracked mtime; // modified time
  @tracked files = []; // if a directory, a list of children
  @tracked isDirectory = false;
  @tracked dimensions = [0, 0];
  @tracked previewBlobUrl = null;
  @tracked previewNeedsCapability = false;
  @tracked previewPowerboxQueryDescriptor = null;
  _reloadRequestId = 0;

  constructor(attrs = {}) {
    Object.assign(this, attrs);
  }

  on(name, target, method) {
    addListener(this, name, target, method);
  }

  off(name, target, method) {
    removeListener(this, name, target, method);
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
    const requestId = ++this._reloadRequestId;
    const items = await client.load(this.path);

    if (requestId !== this._reloadRequestId) {
      return;
    }

    Object.assign(this, items.shift());

    await this.setPropertiesFromItems(items);

    if (requestId !== this._reloadRequestId) {
      return;
    }

    sendEvent(this, 'reload');
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
        this.setPreviewBlobUrl(null);
        this.previewNeedsCapability = false;
        this.previewPowerboxQueryDescriptor = null;
        this.previewFailed = false;

        const contentType = String(previewResponse.headers.get('content-type') || '').toLowerCase();
        if (previewResponse.status === 428 || !previewResponse.ok || contentType.includes('application/json')) {
          let payload = null;
          try {
            payload = await previewResponse.clone().json();
          } catch (e) {
            payload = null;
          }

          if (payload?.powerboxRequired) {
            this.previewNeedsCapability = true;
            this.previewPowerboxQueryDescriptor = payload.queryDescriptor || null;
            return;
          }
        }

        if (!previewResponse.ok) {
          throw new Error(`Preview request failed: ${previewResponse.status}`);
        }

        const pdfBlob = await pdfBlobFromResponse(previewResponse);
        this.setPreviewBlobUrl(URL.createObjectURL(pdfBlob));
      } catch (e) {
        console.error('Document preview failed', e);
        this.setPreviewBlobUrl(null);
        this.previewFailed = true;
      }
    }
  }

  setPreviewBlobUrl(nextUrl) {
    if (this.previewBlobUrl) {
      URL.revokeObjectURL(this.previewBlobUrl);
    }

    this.previewBlobUrl = nextUrl;
  }

  get name() {
    return decodeURIComponent(this.path.split(/[\\/]/).pop());
  }

  get sortedFiles() {
    return [...this.files].sort((a, b) => {
      if (a.isFile !== b.isFile) {
        return a.isFile ? 1 : -1;
      }

      return a.name.localeCompare(b.name);
    });
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
