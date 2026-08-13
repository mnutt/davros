import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DeleteDialog extends Component {
  @tracked progressPercent = null;
  @tracked progressCount = null;
  @tracked totalCount = null;
  @tracked errorMessage = null;

  @action
  async onDelete() {
    this.errorMessage = null;

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
    } catch (error) {
      this.errorMessage = error?.message || 'Delete failed';

      if (!this.args.onDelete) {
        try {
          // Reflect any files deleted before a later request failed. This also
          // removes those paths from the selection, so a retry targets only
          // files that remain.
          await this.args.model.reload();
        } catch {
          // Keep the original deletion error visible if the refresh also fails.
        }
      }
    } finally {
      this.progressPercent = null;
      this.progressCount = null;
      this.totalCount = null;
    }
  }
}
