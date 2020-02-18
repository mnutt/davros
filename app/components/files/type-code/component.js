import Component from '@ember/component';
import fetch from 'ember-network/fetch';

export default Component.extend({
  didInsertElement(){
    if(!this.get('canSandbox')) { return; }
    fetch(this.get('model.rawPath')).then((response) => {
      return response.text();
    }).then((result) => {
      this.set('srcDoc', result);
    });
  },

  canSandbox: function() {
    return "sandbox" in document.createElement("iframe");
  }.property()
});
