import Component from '@glimmer/component';

export default class ModalContentComponent extends Component {
  get defaultContainer() {
    if (typeof document === 'undefined') {
      return null;
    }

    return document.querySelector('.ember-application') || document.body;
  }
}
