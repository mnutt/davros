import Ember from 'ember';

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
    console.log(message);

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
      var self = this;
      var model = this.get('controller.model');
      var parent = model.get('parent');

      if(confirm("Are you sure you want to delete this file?")) {
        return model.destroyRecord().then(function() {
          return self.transitionTo('file', parent);
        });
      } else {
        return true;
      }
    }
  }

});
