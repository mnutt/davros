import Component from '@glimmer/component';

import { action } from '@ember/object';

export default class MenuItem extends Component {
  @action
  handleClick(...args) {
    if (typeof this.args.onClick === 'function') {
      this.args.onClick(...args);
    }
  }
}
