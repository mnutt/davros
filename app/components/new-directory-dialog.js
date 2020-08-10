import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NewDirectoryDialog extends Component {
  @tracked
  directoryName = '';

  directoryValidation = [
    {
      message: 'Directory name is not valid.',
      validate: name => {
        return name.match(/^[^\\/?%*:|"<>.]+$/);
      }
    }
  ];

  @action
  close() {
    this.directoryName = '';
    this.args.onClose();
  }

  @action
  create() {
    this.args.onCreate(this.directoryName).then(() => this.close());
  }
}
