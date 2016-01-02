import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    transitionTo: function(route) {
      if(route === 'files') {
        this.transitionTo('file', '');
      } else {
        this.transitionTo(route);
      }
    }
  }
});
