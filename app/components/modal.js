import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ModalComponent extends Component {
  @tracked active = false;
  container = document.body;

  @action
  toggle() {
    this.active = !this.active;
  }

  @action
  close() {
    this.active = false;
  }

  @action
  open() {
    this.active = true;
  }
}
