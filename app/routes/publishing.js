import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class PublishingRoute extends Route {
  @service publishing;
}
