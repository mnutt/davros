import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

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
    options.rpcId = guidFor(this);
    console.log('rpcid', guidFor(this));
    options.template = this.replacedTemplate;

    if (this.args.clipboardButton) {
      options.clipboardButton = this.args.clipboardButton;
    }
    if (this.args.unauthenticated) {
      options.unauthenticated = this.args.unauthenticated;
    }

    window.parent.postMessage({ renderTemplate: options }, '*');
  }

  @action
  destroyListener() {
    window.removeEventListener('message', this._messageListener);
  }

  messageListener(event) {
    console.log('got', guidFor(this), event.data);
    if (event.data && event.data.rpcId === guidFor(this)) {
      if (event.data.error) {
        // eslint-disable-next-line no-console
        console.error('Offer template error: ' + event.data.error);
      } else {
        this.src = event.data.uri;
      }
    }
  }
}
