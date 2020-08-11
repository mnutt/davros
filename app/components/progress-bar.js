import Component from '@glimmer/component';
import { htmlSafe } from '@ember/string';

export default class ProgressBarComponent extends Component {
  get style() {
    return htmlSafe(`width: ${parseInt(this.args.value)}%`);
  }
}
