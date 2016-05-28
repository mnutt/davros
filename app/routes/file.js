import Ember from 'ember';
import fetch from 'ember-network/fetch';
import $ from 'jquery';
import File from 'davros/models/file';
import ensureCollectionExists from 'davros/lib/ensure-collection-exists';

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
      if(this.get('controller.model.id') === message.file) {
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

    newDirectory: function() {
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

    chooseUpload: function() {
      $("#upload-placeholder").click();
    },

    uploadFile: function (file) {
      var source = file.file.getSource();
      var location = document.location.pathname;
      var path = source.relativePath || file.get('name');

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

      ensureCollectionExists(path).then(() => {
        file.upload('/api/upload', {
          data: {
            destination: [location, path].join('')
          }
        }).then(() => {
          this.get('controller.model').load();
        });
      });
    }
  }

});
