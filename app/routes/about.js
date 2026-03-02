import Route from '@ember/routing/route';

export default class AboutRoute extends Route {
  model() {
    return fetch('/changelog').then(response => {
      return response.text();
    });
  }
}
