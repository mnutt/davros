import Ember from 'ember';
import ajax from 'ic-ajax';
import $ from 'jquery';

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
        this.get('controller.model').reload();
      }
    }
  },

  model: function(params) {
    var id = params.path || '/';
    return this.store.find('file', id);
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
        return ajax({url: model.get('rawPath'), method: 'DELETE'}).then(() => {
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
        return ajax({url: fullPath, method: 'MKCOL'});
      } else {
        alert("The directory name is not valid.");
        this.send('newDirectory');
      }
    },

    chooseUpload: function() {
      $("#upload-placeholder").click();
    }
  }

});
