import { defer } from 'rsvp';
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DeleteDialog extends Component {
  what='this directory';

  @action
  close() {
    this.set('active', false);
  }

  @action
  deleteItem() {
    let _defer = defer();
    this.sendAction('onDelete', _defer);

    _defer.promise.then(() => {
      this.send('close');
    });
  }
}
