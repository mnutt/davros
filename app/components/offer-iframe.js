import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['offer-iframe'],
  tagName: 'iframe',
  attributeBindings: ['src'],
  src: '',

  replacedTemplate: function() {
    var template = this.get('template');
    return template.replace('$API_PROTO', document.location.protocol);
  }.property('template'),

  fillIframe: function() {
    window.parent.postMessage({
      renderTemplate: {
        rpcId: this.get('elementId'),
        template: this.get('replacedTemplate')
      }
    }, "*");
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
