import Route from '@ember/routing/route';
import fetch from 'fetch';

export default Route.extend({
  model: function() {
    return fetch('/changelog').then((response) => {
      return response.text();
    });
  }
});
