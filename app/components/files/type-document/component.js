import Ember from 'ember';
import fetch from 'ember-network/fetch';

const bullet = new RegExp('\uF077\uF077|\uF0B7\uF0B7', 'g');

export default Ember.Component.extend({
  fullview: false,
  classNameBindings: ['fullview'],
  previewState: 'loading',

  didInsertElement(){
    if(!this.get('canSandbox')) { return; }
    let params = {
      url: this.get('model.rawPath'),
      ts: this.get('model.mtime').getTime()
    };

    fetch('/api/preview?' + this.serializeParams(params)).then((response) => {
      return response.text();
    }).then((result) => {
      this.set('previewState', 'loaded');
      result = result.replace(bullet, '&bullet;');
      this.set('srcDoc', result);
    }).catch((error) => {
      this.set('previewState', 'error');
    });
  },

  serializeParams(params) {
    return Object.keys(params).map((key) => {
      return [encodeURIComponent(key),
              encodeURIComponent(params[key])].join('=');
    }).join('&');
  },

  canSandbox: function() {
    return "sandbox" in document.createElement("iframe");
  }.property(),

  actions: {
    toggleFullview() {
      this.toggleProperty('fullview');
      console.log(this.get('fullview'));
    }
  }
});
