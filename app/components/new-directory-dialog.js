import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NewDirectoryDialog extends Component {
  @tracked directoryName = '';
  @tracked validationError = null;

  directoryValidation = [
    {
      message: 'Directory name is not valid.',
      validate: name => {
        return name.match(/^[^\\/?%*:|"<>.]+$/);
      }
    }
  ];

  @action
  focus(element) {
    element.focus();
  }

  @action
  onChange(event) {
    const { value } = event.target;

    if (!this.directoryValidation[0].validate(value)) {
      this.validationError = this.directoryValidation[0].message;
      return;
    } else {
      this.validationError = null;
      this.directoryName = value;
    }
  }

  @action
  close() {
    this.directoryName = '';
    this.validationError = null;
    this.args.onClose();
  }

  @action
  create(event) {
    event.preventDefault();

    this.args.onCreate(this.directoryName).then(() => this.close());
  }
}
