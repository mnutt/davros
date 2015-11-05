import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    transitionTo: function(route) {
      if(route === 'files') {
        this.transitionTo('file', '');
      } else if(route === 'clients') {
        this.transitionTo('clients');
      } else if(route === 'publishing') {
        this.transitionTo('publishing');
      }
    },

    uploadFile: function (file) {
      var source = file.file.getSource();

      var location = document.location.pathname;
      if(location.indexOf('/files') === 0) {
        // if user is in a directory, upload the files there
        location = location.replace(/^\/files\//, '');
      } else {
        // otherwise, upload files in the root directory
        location = '';
      }

      file.upload('/api/upload', {
        data: {
          relativePath: source.relativePath,
          location: location
        }
      }).then((response) => {
        this.transitionTo('file', location);
      });
    }
  }
});
