import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class ProgressBarComponent extends Component {
  get style() {
    return htmlSafe(`width: ${Number.parseInt(this.args.value, 10)}%`);
  }
}
