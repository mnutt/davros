import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Component.extend({
  didInsertElement(){
    if(!this.get('canSandbox')) { return; }
    ajax(this.get('model.rawPath')).then((response) => {
      this.set('srcDoc', response);
    });
  },

  canSandbox: function() {
    return "sandbox" in document.createElement("iframe");
  }.property()
});
