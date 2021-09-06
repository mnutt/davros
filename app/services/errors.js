import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ErrorsService extends Service {
  @tracked error = null;

  clearError() {
    this.error = null;
  }

  setError(error) {
    this.error = error;
  }
}
