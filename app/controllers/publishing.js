import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const apexValidation = [
  {
    message: 'Apex domains (without www) will not work as well',
    validate: input => !input.match(/^\w+\.\w?\w?\w?\w?$/)
  }
];

export default class PublishingController extends Controller {
  @service publishing;
  @tracked domain = '';
  @tracked validationError = null;

  get unsavedDomainIsApex() {
    return !!this.domain;
  }

  get domainIsApex() {
    return !!(this.publishing.domain || '').match(/^\w+\.\w?\w?\w?\w?$/);
  }

  @action
  onChange(event) {
    const { value } = event.target;
    if (!apexValidation[0].validate(value)) {
      this.validationError = apexValidation[0].message;
    } else {
      this.validationError = null;
    }
    this.domain = value;
  }

  async publish() {
    let publishUrl = '/api/publish';
    let { domain } = this;

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

  async unpublish() {
    try {
      await fetch('/api/unpublish', { method: 'POST' });
      this.publishing.update({});
    } catch (error) {
      this.publishing.update(null, error);
    }
  }

  @action togglePublish() {
    return this.publishing.publicId ? this.unpublish() : this.publish();
  }
}
