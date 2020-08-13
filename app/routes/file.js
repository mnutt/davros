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
    const newModelAttrs = await File.load(this.context.path);
    this.context.files = newModelAttrs.files;
  }

  model(params) {
    const path = params.path || '';
    return File.load(path);
  }

  @task({
    maxConcurrency: 5,
    enqueue: true
  })
  *uploadFile(file) {
    if (file.blob.type === '') {
      yield;
    } // it's a directory

    let location = document.location.pathname;
    let path = file.blob.webkitRelativePath || file.fullPath || file.name;

    if (location.indexOf('/files') === 0) {
      // if user is in a directory, upload the files there
      location = location.replace(/^\/files\//, '');
      // dirname of current path, so if path is /foo/README, use /foo/
      location = location.replace(/\/[^/]*$/, '');
    } else {
      // otherwise, upload files in the root directory
      // (this shouldn't happen anymore)
      location = '';
    }

    if (path[0] !== '/') {
      path = '/' + path;
    }

    var fullPath = [location, path].join('');

    yield File.ensureCollectionExists(fullPath).then(() => {
      return file
        .upload('/api/upload', {
          data: {
            destination: fullPath
          }
        })
        .then(() => {
          return this.reload();
        });
    });
  }

  @action
  delete() {
    const { model } = this.controller;
    const { parent } = model;

    return model.remove().then(() => {
      if (parent) {
        this.transitionTo('file', parent);
      } else {
        this.transitionTo('files');
      }
    });
  }

  @action
  newDirectory(dirname) {
    const { model } = this.controller;

    const fullPath = [model.rawPath, dirname].join('/');

    return fetch(fullPath, { method: 'MKCOL' }).then(() => {
      return File.load(model.path);
    });
  }

  @action
  upload(file) {
    this.uploadFile.perform(file);
  }
}
