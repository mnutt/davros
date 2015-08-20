import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.store.find('file', '/');
  },

  renderTemplate: function() {
    this.render('directory');
  }
});
