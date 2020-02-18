import Route from '@ember/routing/route';
import fetch from 'ember-network/fetch';

export default Route.extend({
  model: function() {
    return fetch('/changelog').then((response) => {
      return response.text();
    });
  }
});
