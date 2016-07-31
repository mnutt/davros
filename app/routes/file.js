import Ember from 'ember';
import fetch from 'ember-network/fetch';
import $ from 'jquery';
import File from 'davros/models/file';
import ensureCollectionExists from 'davros/lib/ensure-collection-exists';
import { task } from 'ember-concurrency';

export default Ember.Route.extend({

  socketUrl: ((document.location.protocol === 'https:') ? 'wss://' : 'ws://') + document.location.host,
  socketService: Ember.inject.service('websockets'),

  init: function() {
    this._super.apply(this, arguments);

    var socket = this.get('socketService').socketFor(this.get('socketUrl'));

    socket.on('message', this.messageHandler, this);
  },

  messageHandler: function(rawMessage) {
    var message = JSON.parse(rawMessage.data);

    if(message.file) {
      if(message.file === "/") { message.file = ""; }
      if(this.get('controller.model.path') === message.file) {
        this.get('controller.model').load();
      }
    }
  },

  model: function(params) {
    var id = params.path || '';
    var file = File.create({path: id});
    return file.load();
  },

  renderTemplate: function() {
    if(this.get('controller.model.isDirectory')) {
      this.render('directory');
    } else {
      this.render('file');
    }
  },

  uploadFile: task(function * (file) {
    console.log(file.get('name'), file.blob.type);
    if(file.blob.type === "") { yield; } // it's a directory
    var location = document.location.pathname;
    var path = file.blob.webkitRelativePath || file.get('name');

    if(location.indexOf('/files') === 0) {
      // if user is in a directory, upload the files there
      location = location.replace(/^\/files\//, '');
      // dirname of current path, so if path is /foo/README, use /foo/
      location = location.replace(/\/[^\/]*$/, '');
    } else {
      // otherwise, upload files in the root directory
      // (this shouldn't happen anymore)
      location = '';
    }

    if(path[0] !== '/') { path = '/' + path; }

    console.log("uploading " + path + " into location " + location);

    var fullPath = [location, path].join('');

    yield ensureCollectionExists(fullPath).then(() => {
      return file.upload('/api/upload', {
        data: {
          destination: fullPath
        }
      }).then(() => {
        return this.get('controller.model').load();
      });
    });
  }).maxConcurrency(5).enqueue(),

  actions: {
    "delete": function() {
      var model = this.get('controller.model');
      var parent = model.get('parent');
      var type = model.get('isDirectory') ? 'directory and everything in it' : 'file';

      if(confirm("Are you sure you want to delete this " + type + "? It will also be deleted from any synced clients.")) {
        return model.delete().then(() => {
          return this.transitionTo('file', parent);
        });
      } else {
        return true;
      }
    },

    newDirectory() {
      var model = this.get('controller.model');

      var dirname = prompt("Directory name");
      if(!dirname || !dirname.length) {
        console.log("New directory cancelled.");
        return;
      }

      if(dirname.match(/^[^\\/?%*:|"<>\.]+$/)) {
        var fullPath = [model.get('rawPath'), dirname].join('/');
        return fetch(fullPath, {method: 'MKCOL'}).then(() => {
          return this.get('controller.model').load();
        });
      } else {
        alert("The directory name is not valid.");
        this.send('newDirectory');
      }
    },

    chooseUpload() {
      $("#upload-placeholder").click();
    },

    downloadDirectory() {
      var path = this.get('controller.model.path');
      var endpoint = "/api/archive?path=" + encodeURIComponent(path);
      document.location.href = endpoint;
    },

    upload: function(file) {
      console.log("UPLOAD");
      this.get('uploadFile').perform(file);
    }

  }

});
