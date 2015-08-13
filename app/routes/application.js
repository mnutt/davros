export default Ember.Route.extend({
  actions: {
    transitionTo: function(route) {
      if(route === 'files') {
        this.transitionTo('file', '');
      } else if(route === 'clients') {
        this.transitionTo('clients');
      }
    }
  }
});
