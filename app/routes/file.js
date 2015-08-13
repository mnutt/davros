import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var id = params.path;
    if(!id) { id = '/'; }
    return this.store.find('file', id);
  },

  setupController: function(controller, model) {
    this._super(controller, model);

    model.reload();
  },

  renderTemplate: function() {
    if(this.get('controller.model.isDirectory')) {
      this.render('directory');
    } else {
      this.render('file');
    }
  }
});
