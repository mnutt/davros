import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    transitionTo: function(route) {
      if(route === 'files') {
        this.transitionTo('file', '');
      } else {
        this.transitionTo(route);
      }
    },

    uploadFile: function (file) {
      var source = file.file.getSource();
      var location = document.location.pathname;

      if(location.indexOf('/files') === 0) {
        // if user is in a directory, upload the files there
        location = location.replace(/^\/files\//, '');
        // dirname of current path, so if path is /foo/README, use /foo/
        location = location.replace(/\/[^\/]*$/, '');
      } else {
        // otherwise, upload files in the root directory
        location = '';
      }

      console.log("uploading " + source.relativePath + " into location " + location);

      file.upload('/api/upload', {
        data: {
          relativePath: source.relativePath,
          location: location
        }
      }).then(() => {
        this.transitionTo('file', location);
      });
    }
  }
});
