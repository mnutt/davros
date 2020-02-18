import { on } from '@ember/object/evented';
import { on } from '@ember/object/evented';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['offer-iframe'],
  tagName: 'iframe',
  attributeBindings: ['src'],
  src: '',

  replacedTemplate: function() {
    var template = this.content;
    return template.replace('$API_PROTO', document.location.protocol);
  }.property('content'),

  fillIframe: on('didInsertElement', function() {
    let options = {};
    options.rpcId = this.elementId;
    options.template = this.replacedTemplate;

    if(this.clipboardButton) {
      options.clipboardButton = this.clipboardButton;
    }
    if(this.unauthenticated) {
      options.unauthenticated = this.unauthenticated;
    }

    window.parent.postMessage({ renderTemplate: options }, "*");
  }),

  registerMessageListener: on('willInsertElement', function() {
    this.$(window).on('message', this.messageListener.bind(this));
  }),

  messageListener: function(e) {
    var event = e.originalEvent;
    if (event.data && event.data.rpcId === this.elementId) {
      if (event.data.error) {
        console.error("Offer template error: " + event.data.error);
      } else {
        this.set('src', event.data.uri);
      }
    }
  }
});
