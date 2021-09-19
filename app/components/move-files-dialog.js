import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MoveFilesDialogComponent extends Component {
  @service errors;

  @tracked progressPercent = null;
  @tracked progressCount = null;

  get selectedFiles() {
    return this.args.selectedFiles;
  }

  get selectedFilesDescription() {
    if (this.selectedFiles.size === 0) {
      return '';
    }

    const { model } = this.args;

    const firstPath = this.selectedFiles.values().next().value;
    const firstFile = model.files.find((f) => f.path === firstPath);
    const firstName = firstFile.name;

    if (this.selectedFiles.size === 1) {
      return firstName;
    } else {
      const others = this.selectedFiles.size > 2 ? 'other files' : 'other file';
      return [firstName, '&', this.selectedFiles.size - 1, others].join(' ');
    }
  }

  @action
  async moveSelectedFiles(destination) {
    const paths = this.selectedFiles.values();
    const { sortedFiles } = this.args.model;

    this.progressPercent = 0.01;
    this.progressCount = 0;
    const failures = [];

    for (let path of paths) {
      const file = sortedFiles.find((f) => f.path === path);
      const response = await file.move(destination);
      if (!response.ok) {
        failures.push(file.name);
      }
      this.progressPercent = (++this.progressCount / this.selectedFiles.size) * 100;
    }

    this.args.onFinish();
    this.progressPercent = null;
    this.progressCount = null;

    if (failures.length) {
      let message = `Could not move ${failures.shift()}`;
      if (failures.length) {
        message += ` and ${failures.length} other${failures.length > 1 ? 's' : ''}`;
      }
      this.errors.setError(message);
    }
  }
}
