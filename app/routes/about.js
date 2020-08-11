import Route from '@ember/routing/route';
import fetch from 'fetch';

export default class AboutRoute extends Route {
  model() {
    return fetch('/changelog').then(response => {
      return response.text();
    });
  }
}
