import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DeleteDialog extends Component {
  @tracked newName = 'new-file';
  @tracked validationError = null;
  @tracked warning = null;

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
    const { sortedFiles } = this.args.model;
    const selectedPath = this.args.selectedFiles.values().next().value;
    const selectedFile = sortedFiles.find((f) => f.path === selectedPath);
    this.newName = selectedFile.name;
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
    if (targetExists(value)) {
      this.warning = "File name already exists. Warning! This will overwrite!";
      return;
    } else {
      this.warning = null;
    }
  }

  @action
  async rename(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const { sortedFiles } = this.args.model;
    const selectedPath = this.args.selectedFiles.values().next().value;
    const selectedFile = sortedFiles.find((f) => f.path === selectedPath);

    const newName = this.newName;
    try {
      await selectedFile.rename(newName);
    } catch (err) {
      this.errors.setError(err.message);
    }

    this.args.onFinish();
  }
}
