import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { action } from '@ember/object';
import File from 'davros/models/file';

export default class PickerComponent extends Component {
  @tracked isLoading = true;
  @tracked error;
  @tracked model;
  @tracked path = '';

  @action
  loadInitialPath() {
    this.load(this.args.initialPath);
  }

  async load(path) {
    console.log('LOADING', path);
    this.path = path;
    this.isLoading = true;

    try {
      this.model = await File.load(path);
    } catch (err) {
      this.error = err;
    } finally {
      this.isLoading = false;
    }
  }

  get filter() {
    return { isDirectory: this.args.directoriesOnly };
  }

  get path() {
    return this.model ? this.model.path : this.args.initialPath;
  }

  @action
  onBreadcrumbClick(path, event) {
    return this.onClick({ path, isDirectory: true }, event);
  }

  @action
  onClick(file, event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (file.isDirectory) {
      this.load(file.path);
    } else {
      if (this.args.directoriesOnly) {
        return;
      }

      this.args.onSelected(file.path);
    }
  }
}
