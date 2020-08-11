import Route from '@ember/routing/route';

export default class NotFoundRoute extends Route {
  beforeModel(transition) {
    // Redirect /files to file route
    const path = transition.params['not-found'].path;
    if (path === 'files/' || path === 'files') {
      this.transitionTo('files');
    }

    return true;
  }
}
