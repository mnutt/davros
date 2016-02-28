import Ember from 'ember';

export default Ember.Controller.extend({
  unauthenticated: {
    options: {dav: ["1", "2", "3", "extended-mkcol"]},
    resources: {
      "/status.php": {
        type: "text/json",
        body: JSON.stringify({
          installed: "true",
          version: "5.0.17",
          versionstring: "5.0.10",
          edition: ""})
      }
    }
  }
});
