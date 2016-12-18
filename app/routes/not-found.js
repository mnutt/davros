import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(transition) {
    // Redirect /files to file route
    var path = transition.params['not-found'].path;
    if(path === "files/" || path === "files") {
      this.transitionTo('file', { queryParams: { path: "" }});
    }

    return true;
  }
});
