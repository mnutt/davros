import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class ApplicationRoute extends Route {
  @action
  transitionTo(route) {
    if (route === 'files') {
      this.transitionTo('file', '');
    } else {
      this.transitionTo(route);
    }
  }
}
