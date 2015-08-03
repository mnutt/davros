import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.store.find('file', params.path);
  },

  setupController: function(controller, model) {
    this._super(controller, model);

    model.reload();
  }
});
