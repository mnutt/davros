import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import { tracked } from '@glimmer/tracking';

export default class PublishingService extends Service {
  @service errors;
  @tracked data = null;

  constructor() {
    super(...arguments);

    this.fetchPublishingData();
  }

  async fetchPublishingData() {
    try {
      const response = await fetch('/api/publish/info');
      const result = await response.json();
      this.update(result);
    } catch (error) {
      this.errors.setError(error.message);
    }
  }

  update(data) {
    this.data = data;
  }

  get domain() {
    return this.data && this.data.domain;
  }

  get autoUrl() {
    return this.data && this.data.autoUrl;
  }

  get publicId() {
    return this.data && this.data.publicId;
  }

  get host() {
    return this.data && this.data.host;
  }

  get urlBase() {
    const { domain, autoUrl } = this;

    if (domain) {
      return `https://${domain}`;
    } else if (autoUrl) {
      return autoUrl;
    } else {
      return null;
    }
  }
}
