import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(transition) {
    // Redirect /files to file route
    if(transition.params['not-found'].path.indexOf("files") === 0) {
      this.transitionTo('file', '');
    }
  }
});
