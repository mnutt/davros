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
    const { files } = this.args.model;
    return [...this.args.selectedFiles].map((path) => files.find((f) => f.path === path).name);
  }

  @action
  async onDelete() {
    const paths = [...this.selectedFiles];
    const { files } = this.args.model;
    this.progressPercent = 0.01;

    for (let path of paths) {
      const file = files.find((f) => f.path === path);
      await file.remove();
      this.progressPercent = (++this.progressCount / paths.length) * 100;
    }

    this.progressPercent = null;
    this.progressCount = null;
    this.args.onFinish();
  }
}
