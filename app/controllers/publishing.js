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
}
