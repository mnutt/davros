import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DeleteDialog extends Component {
  @tracked progressPercent = null;
  @tracked progressCount = null;
  @tracked totalCount = null;

  @action
  async onDelete() {
    try {
      if (this.args.onDelete) {
        this.progressPercent = 0.01;
        this.progressCount = 0;
        this.totalCount = 1;
        await this.args.onDelete();
        return;
      }

      const paths = [...this.args.selectedFiles];
      const { files } = this.args.model;
      this.progressPercent = 0.01;
      this.progressCount = 0;
      this.totalCount = paths.length;

      for (let path of paths) {
        const file = files.find((f) => f.path === path);
        await file.remove();
        this.progressPercent = (++this.progressCount / paths.length) * 100;
      }

      await this.args.onFinish();
    } finally {
      this.progressPercent = null;
      this.progressCount = null;
      this.totalCount = null;
    }
  }
}
