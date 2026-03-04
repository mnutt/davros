import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class RenameDialog extends Component {
  @tracked newName = 'new-file';
  @tracked validationError = null;
  @tracked isRenaming = false;
  @tracked confirmDialogActive = false;
  @tracked confirmDialogMessage = '';
  _confirmResolver = null;

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
  }

  @action
  async rename(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const { sortedFiles } = this.args.model;
    const selectedPath = this.args.selectedFiles.values().next().value;
    const selectedFile = sortedFiles.find((f) => f.path === selectedPath);

    const newName = this.newName;
    this.isRenaming = true;
    try {
      let response = await selectedFile.rename(newName, { overwrite: false });
      if (response.status === 412) {
        this.isRenaming = false;
        const confirmed = await this.requestOverwriteConfirmation(newName);
        if (!confirmed) {
          return;
        }
        this.isRenaming = true;
        response = await selectedFile.rename(newName, { overwrite: true });
      }

      if (!response.ok) {
        this.errors.setError(`Could not rename ${selectedFile.name}`);
        return;
      }

      await this.args.onFinish();
    } catch (err) {
      this.errors.setError(err.message);
      return;
    } finally {
      this.confirmDialogActive = false;
      this.isRenaming = false;
    }
  }

  requestOverwriteConfirmation(fileName) {
    this.confirmDialogMessage = `"${fileName}" already exists. Do you want to overwrite it?`;
    this.confirmDialogActive = true;
    return new Promise((resolve) => {
      this._confirmResolver = resolve;
    });
  }

  @action
  confirmOverwrite() {
    this.resolveConfirmation(true);
  }

  @action
  cancelOverwrite() {
    this.resolveConfirmation(false);
  }

  resolveConfirmation(value) {
    this.confirmDialogActive = false;
    const resolver = this._confirmResolver;
    this._confirmResolver = null;
    if (resolver) {
      resolver(value);
    }
  }
}
