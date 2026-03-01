import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import File from 'davros/models/file';

const socketUrl =
  (document.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  document.location.host +
  '/ws-files';

export default class FileRoute extends Route {
  templateName = 'file';
  @service websockets;
  reloadPromise = null;
  reloadRequestedWhilePending = false;

  constructor() {
    super(...arguments);

    this.setupWebsockets();
  }

  setupWebsockets() {
    const socket = this.websockets.socketFor(socketUrl);
    socket.on('message', this.messageHandler, this);
  }

  // This is used by both `FileRoute` and `FilesRoute` (which extends `FileRoute`).
  // `messageHandler` fires twice on every message; in the root directory `FilesRoute`
  // will have a `context` while in nested directories `FileRoute` will.
  messageHandler(rawMessage) {
    const message = JSON.parse(rawMessage.data);
    const contextPath = this.context && this.context.path;

    if (message.file) {
      if (
        typeof contextPath === 'string' &&
        this.normalizePath(contextPath) === this.normalizePath(message.file)
      ) {
        this.reload();
      }
    }
  }

  normalizePath(path) {
    if (!path || path === '/') {
      return '';
    }

    return String(path).replace(/^\/+/, '').replace(/\/+$/, '');
  }

  reload() {
    if (!this.context || typeof this.context.reload !== 'function') {
      return Promise.resolve();
    }

    if (this.reloadPromise) {
      this.reloadRequestedWhilePending = true;
      return this.reloadPromise;
    }

    this.reloadPromise = this.context.reload().finally(() => {
      this.reloadPromise = null;

      if (this.reloadRequestedWhilePending) {
        this.reloadRequestedWhilePending = false;
        this.reload();
      }
    });

    return this.reloadPromise;
  }

  model(params) {
    const path = params.path || '';
    return File.load(path);
  }

  redirect(model) {
    const params = this.paramsFor('file');
    if (model.isDirectory && params.path && !params.path.endsWith('/')) {
      this.replaceWith('file', model.path + '/');
    }
  }
}
