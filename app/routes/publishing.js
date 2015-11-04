import Ember from 'ember';
import ajax from 'ic-ajax';

export default Ember.Route.extend({
  model: function() {
    return ajax('/api/publish/info');
  },

  actions: {
    publish: function() {
      ajax({url: '/api/publish', method: 'post'}).then((result) => {
        this.set('controller.model', result);
      });
    },

    unpublish: function() {
      ajax({url: '/api/unpublish', method: 'post'}).then(() => {
        this.set('controller.model', {});
      });
    }
  }
});
