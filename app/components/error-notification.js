import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ErrorNotificationComponent extends Component {
  @service errors;

  @action
  hide() {
    this.errors.clearError();
  }
}
