import Ember from 'ember';
import fetch from 'ember-network/fetch';

export default Ember.Route.extend({
  model: function() {
    return fetch('/changelog').then((response) => {
      return response.text();
    });
  }
});
