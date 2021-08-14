import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import fetch from 'fetch';

export default class PublishingRoute extends Route {
  @service publishing;
}
