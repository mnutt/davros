import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import fetch from 'fetch';
import File from 'davros/models/file';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';

const socketUrl =
  (document.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  document.location.host +
  '/ws-files';

export default class FileRoute extends Route {
  templateName = 'file';
  @service websockets;

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

    if (message.file) {
      if (message.file === '/') {
        message.file = '';
      }

      if (this.context && this.context.path === message.file) {
        this.reload();
      }
    }
  }

  async reload() {
    const newModelAttrs = await File.load(this.context && this.context.path);
    this.context.files = newModelAttrs.files;
  }

  model(params) {
    const path = params.path || '';
    return File.load(path);
  }
}
