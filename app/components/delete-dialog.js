import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DeleteDialog extends Component {
  @tracked progressPercent = null;
  @tracked progressCount = null;

  get selectedFiles() {
    return this.args.selectedFiles;
  }

  get selectedFileList() {
    return [...this.args.selectedFiles];
  }

  @action
  async onDelete() {
    const selectedFiles = [...this.selectedFiles];
    this.progressPercent = 0.01;
    for (let file of selectedFiles) {
      await file.remove();
      this.progressPercent = (++this.progressCount / selectedFiles.length) * 100;
    }

    this.progressPercent = null;
    this.progressCount = null;
    this.args.onFinish();
  }
}
