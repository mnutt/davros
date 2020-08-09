import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import fetch from 'fetch';
import File from 'davros/models/file';
import ensureCollectionExists from 'davros/lib/ensure-collection-exists';
import { task } from 'ember-concurrency';

const socketUrl =
  (document.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  document.location.host +
  '/ws-files';

export default Route.extend({
  websockets: service(),

  init() {
    this._super(...arguments);

    const socket = this.websockets.socketFor(socketUrl);

    socket.on('message', this.messageHandler, this);
  },

  messageHandler: function(rawMessage) {
    var message = JSON.parse(rawMessage.data);

    if (message.file) {
      if (message.file === '/') {
        message.file = '';
      }
      if (this.get('controller.model.path') === message.file) {
        this.get('controller.model').load();
      }
    }
  },

  model: function(params) {
    var id = params.path || '';
    var file = File.create({ path: id });
    return file.load();
  },

  renderTemplate: function() {
    if (this.get('controller.model.isDirectory')) {
      this.render('directory');
    } else {
      this.render('file');
    }
  },

  uploadFile: task(function*(file) {
    if (file.blob.type === '') {
      yield;
    } // it's a directory
    var location = document.location.pathname;
    var path = file.blob.webkitRelativePath || file.get('fullPath') || file.get('name');

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

    yield ensureCollectionExists(fullPath, this.get('controller.model.client')).then(() => {
      return file
        .upload('/api/upload', {
          data: {
            destination: fullPath
          }
        })
        .then(() => {
          return this.get('controller.model').load();
        });
    });
  })
    .maxConcurrency(5)
    .enqueue(),

  actions: {
    delete: function() {
      var model = this.get('controller.model');
      var parent = model.get('parent');

      return model.remove().then(() => {
        if (parent) {
          this.transitionTo('file', parent);
        } else {
          this.transitionTo('files');
        }
      });
    },

    newDirectory(dirname) {
      var model = this.get('controller.model');

      var fullPath = [model.get('rawPath'), dirname].join('/');
      return fetch(fullPath, { method: 'MKCOL' }).then(() => {
        return this.get('controller.model').load();
      });
    },

    downloadDirectory() {
      var path = this.get('controller.model.path');
      var endpoint = '/api/archive?path=' + encodeURIComponent(path);
      document.location.href = endpoint;
    },

    upload: function(file) {
      this.uploadFile.perform(file);
    }
  }
});
