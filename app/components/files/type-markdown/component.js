import Component from '@ember/component';
import fetch from 'ember-network/fetch';

export default Component.extend({
  rawContent: 'Loading...',

  didInsertElement: function() {
    fetch(this.get('model.rawPath')).then((response) => {
      return response.text();
    }).then((result) => {
      this.set('rawContent', result);
    });
  }
});
