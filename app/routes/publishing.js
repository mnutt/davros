import Ember from 'ember';
import fetch from 'ember-network/fetch';

export default Ember.Route.extend({
  model: function() {
    return fetch('/api/publish/info').then((response) => {
      return response.json();
    });
  },

  actions: {
    publish: function() {
      fetch('/api/publish', {method: 'POST'}).then((response) => {
        return response.json();
      }).then((result) => {
        this.set('controller.model', result);
      });
    },

    unpublish: function() {
      fetch('/api/unpublish', {method: 'POST'}).then(() => {
        this.set('controller.model', {});
      });
    }
  }
});
