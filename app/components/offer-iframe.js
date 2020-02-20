import { computed } from '@ember/object';
import { on } from '@ember/object/evented';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['offer-iframe'],
  tagName: 'iframe',
  attributeBindings: ['src'],
  src: '',

  replacedTemplate: computed('content', function() {
    var template = this.content;
    return template.replace('$API_PROTO', document.location.protocol);
  }),

  didInsertElement() {
    let options = {};
    options.rpcId = this.elementId;
    options.template = this.replacedTemplate;

    if (this.clipboardButton) {
      options.clipboardButton = this.clipboardButton;
    }
    if (this.unauthenticated) {
      options.unauthenticated = this.unauthenticated;
    }

    window.parent.postMessage({ renderTemplate: options }, '*');
  },

  registerMessageListener: on('willInsertElement', function() {
    window.addEventListener('message', this.messageListener.bind(this));
  }),

  messageListener: function(event) {
    if (event.data && event.data.rpcId === this.elementId) {
      if (event.data.error) {
        // eslint-disable-next-line no-console
        console.error('Offer template error: ' + event.data.error);
      } else {
        this.set('src', event.data.uri);
      }
    }
  }
});
