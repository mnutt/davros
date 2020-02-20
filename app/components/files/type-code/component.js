import { computed } from '@ember/object';
import Component from '@ember/component';
import fetch from 'fetch';

export default Component.extend({
  didInsertElement(){
    if(!this.canSandbox) { return; }
    fetch(this.get('model.rawPath')).then((response) => {
      return response.text();
    }).then((result) => {
      this.set('srcDoc', result);
    });
  },

  canSandbox: computed(function() {
    return "sandbox" in document.createElement("iframe");
  })
});
