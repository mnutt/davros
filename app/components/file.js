import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class FileComponent extends Component {
  deleteDialogActive = false;

  @service permissions;
  @service publishing;

  // for convenience
  get model() {
    return this.args.model;
  }

  get canEdit() {
    return this.permissions.can('edit');
  }

  get publicUrl() {
    const urlBase = this.publishing && this.publishing.urlBase;
    if (!urlBase) {
      return null;
    }

    return [urlBase, this.model.path].join('/');
  }
}
