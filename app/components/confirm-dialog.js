import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ConfirmDialogComponent extends Component {
  get title() {
    return this.args.title || 'Confirm';
  }

  get cancelLabel() {
    return this.args.cancelLabel || 'Cancel';
  }

  get confirmLabel() {
    return this.args.confirmLabel || 'Confirm';
  }

  get confirmButtonClass() {
    return this.args.confirmButtonClass || 'button-primary';
  }

  @action
  confirm(event) {
    event.preventDefault();
    this.args.onConfirm?.();
  }
}
