import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import fetch from 'fetch';

export default class PublishingRoute extends Route {
  @service publishing;

  @action
  async publish() {
    let publishUrl = '/api/publish';
    let { domain } = this.controller;

    if (domain && domain !== '') {
      publishUrl += `?domain=${encodeURIComponent(domain)}`;
    }

    try {
      const response = await fetch(publishUrl, { method: 'POST' });
      const result = await response.json();
      this.publishing.update(result);
    } catch (error) {
      this.publishing.update(null, error);
    }
  }

  @action
  async unpublish() {
    try {
      await fetch('/api/unpublish', { method: 'POST' });
      this.publishing.update({});
    } catch (error) {
      this.publishing.update(null, error);
    }
  }
}
