import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class HomeRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('files');
  }
}
