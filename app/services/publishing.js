import Service from '@ember/service';
import fetch from 'fetch';
import { tracked } from '@glimmer/tracking';

export default class PublishingService extends Service {
  @tracked data = null;
  @tracked error = null;

  constructor() {
    super(...arguments);

    this.fetchPublishingData();
  }

  async fetchPublishingData() {
    try {
      const response = await fetch('/api/publish/info');
      const result = await response.json();
      this.update(result, null);
    } catch (error) {
      this.update(null, error);
    }
  }

  update(data, error) {
    this.data = data;
    this.error = error;
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
