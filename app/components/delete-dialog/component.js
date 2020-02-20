import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DeleteDialog extends Component {
  what = 'this directory';

  @action
  onDelete() {
    this.args.onClose();
    this.args.onDelete();
  }
}
