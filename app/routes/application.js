import Route from '@ember/routing/route';

export default Route.extend({
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
