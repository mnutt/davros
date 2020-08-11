import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  @service permissions;

  get canEdit() {
    return this.permissions.can('edit');
  }

  get canSync() {
    return this.permissions.can('edit');
  }
}
