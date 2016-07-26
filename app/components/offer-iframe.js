import Ember from 'ember';
import owncloudStatus from 'davros/lib/owncloud';

export default Ember.Component.extend({
  classNames: ['offer-iframe'],
  tagName: 'iframe',
  attributeBindings: ['src'],
  src: '',

  replacedTemplate: function() {
    var template = this.get('content');
    return template.replace('$API_PROTO', document.location.protocol);
  }.property('content'),

  fillIframe: function() {
    let options = {};
    options.rpcId = this.get('elementId');
    options.template = this.get('replacedTemplate');
    options.static = owncloudStatus;

    if(this.get('clipboardButton')) {
      options.clipboardButton = this.get('clipboardButton');
    }
    if(this.get('unauthenticated')) {
      options.unauthenticated = this.get('unauthenticated');
    }

    window.parent.postMessage({ renderTemplate: options }, "*");
  }.on('didInsertElement'),

  registerMessageListener: function() {
    this.$(window).on('message', this.messageListener.bind(this));
  }.on('willInsertElement'),

  messageListener: function(e) {
    var event = e.originalEvent;
    if (event.data && event.data.rpcId === this.get('elementId')) {
      if (event.data.error) {
        console.error("Offer template error: " + event.data.error);
      } else {
        this.set('src', event.data.uri);
      }
    }
  }
});
