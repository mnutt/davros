import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DeleteDialog extends Component {
  @tracked newName = 'new-file';
  @tracked validationError = null;

  @service errors;

  nameValidation = [
    {
      message: 'File name is not valid.',
      validate: (name) => {
        return name.match(/^[^/]+$/);
      },
    },
  ];

  @action
  setInitialName() {
    this.newName = this.args.selectedFiles.values().next().value.name;
  }

  @action
  focus(element) {
    element.focus();
  }

  @action
  onChange(event) {
    const { value } = event.target;

    if (!this.nameValidation[0].validate(value)) {
      this.validationError = this.nameValidation[0].message;
      return;
    } else {
      this.validationError = null;
      this.newName = value;
    }
  }

  @action
  async rename(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const selectedFile = this.args.selectedFiles.values().next().value;

    const newName = this.newName;
    try {
      await selectedFile.rename(newName);
    } catch (err) {
      this.errors.setError(err.message);
    }

    this.args.onFinish();
  }
}
