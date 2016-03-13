import Ember from 'ember';
import ajax from 'ic-ajax';
import pathSignature from '../../lib/path-signature';

export default Ember.Component.extend({
  showingPreview: Ember.computed.not('model.isLarge'),

  didInsertElement(){
    if(!this.get('canSandbox')) { return; }

    if(this.get('showingPreview')) {
      this.getSrcDoc();
    }
  },

  getSrcDoc: function() {
    pathSignature(this.get('model.rawPath')).then((path) => {
      ajax(path).then((response) => {
        this.set('srcDoc', response);
      });
    });
  },

  canSandbox: function() {
    return "sandbox" in document.createElement("iframe");
  }.property(),

  actions: {
    showPreview: function() {
      this.set('showingPreview', true);
      this.getSrcDoc();
    }
  }
});
