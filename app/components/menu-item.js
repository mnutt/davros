import Component from '@glimmer/component';

import { action } from '@ember/object';

export default class MenuItem extends Component {
  @action
  handleClick() {
    this.dropdown.actions.close();
    if (typeof this.onClick === 'function') {
      this.onClick(...arguments);
    }
  }
}
