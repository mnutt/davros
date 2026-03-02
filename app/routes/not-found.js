import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NotFoundRoute extends Route {
  @service router;

  beforeModel(transition) {
    // Redirect /files to file route
    const path = transition.params['not-found'].path;
    if (path === 'files/' || path === 'files') {
      this.router.transitionTo('files');
    }

    return true;
  }
}
