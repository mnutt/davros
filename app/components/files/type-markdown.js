import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Component.extend({
  rawContent: 'Loading...',

  didInsertElement: function() {
    ajax(this.get('model.rawPath')).then((response) => {
      this.set('rawContent', response);
    });
  }
});
