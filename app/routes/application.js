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
      file.upload('/api/upload', {
        data: {
          relativePath: source.relativePath,
          location: document.location.pathname.replace(/^\/files\//, '')
        }
      });
    }
  }
});
