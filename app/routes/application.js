import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service router;

  activate() {
    super.activate(...arguments);

    this.router.on('routeDidChange', this, this.updateSandstormPath);
    this.updateSandstormPath();
  }

  deactivate() {
    this.router.off('routeDidChange', this, this.updateSandstormPath);
    super.deactivate(...arguments);
  }

  @action
  updateSandstormPath() {
    window.parent.postMessage(
      {
        setPath: this.router.currentURL || '/',
      },
      '*'
    );
  }

  @action
  transitionTo(route) {
    if (route === 'files') {
      this.router.transitionTo('file', '');
    } else {
      this.router.transitionTo(route);
    }
  }
}
