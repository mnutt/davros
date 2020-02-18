import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel: function(transition) {
    // Redirect /files to file route
    var path = transition.params['not-found'].path;
    if(path === "files/" || path === "files") {
      this.transitionTo('files');
    }

    return true;
  }
});
