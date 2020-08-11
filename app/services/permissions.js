import Service from '@ember/service';
import fetch from 'fetch';
import { tracked } from '@glimmer/tracking';

function isIframed() {
  return window.top !== window;
}

export default class PermissionsService extends Service {
  @tracked error = false;
  @tracked list = [];

  constructor() {
    super(...arguments);

    if (!isIframed()) {
      this.set('list', ['read', 'edit']);
      return;
    }

    this.getPermissions();
  }

  async getPermissions() {
    try {
      const response = await fetch('/api/permissions');
      const result = await response.json();
      this.list = result.permissions;
    } catch (e) {
      this.error = err;
      this.list = [];
    }
  }

  can(permission) {
    if (this.error) {
      return true;
    } // fail safe in case permissions not available

    return this.list.includes(permission);
  }
}
