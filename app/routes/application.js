import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    transitionTo: function(route) {
      if(route === 'files') {
        this.transitionTo('file', '');
      } else if(route === 'clients') {
        this.transitionTo('clients');
      }
    },

    uploadFile: function (file) {
      console.log("UPLOAD");
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
