import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class OfferIframe extends Component {
  @tracked src = '';

  get replacedTemplate() {
    const template = this.args.content || '';
    return template.replace('$API_PROTO', document.location.protocol);
  }

  @action
  setupListener() {
    this._messageListener = this.messageListener.bind(this);
    window.addEventListener('message', this._messageListener);

    let options = {};
    options.rpcId = this.elementId;
    options.template = this.replacedTemplate;

    if (this.clipboardButton) {
      options.clipboardButton = this.clipboardButton;
    }
    if (this.unauthenticated) {
      options.unauthenticated = this.unauthenticated;
    }

    window.parent.postMessage({ renderTemplate: options }, '*');
  }

  @action
  destroyListener() {
    window.removeEventListener('message', this._messageListener);
  }

  messageListener(event) {
    if (event.data && event.data.rpcId === this.elementId) {
      if (event.data.error) {
        // eslint-disable-next-line no-console
        console.error('Offer template error: ' + event.data.error);
      } else {
        this.src = event.data.uri;
      }
    }
  }
}
