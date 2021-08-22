import { run } from '@ember/runloop';
import Helper from '@ember/component/helper';
import { formatDistanceToNowStrict } from 'date-fns';
import locales from '../lib/date-locales';
import { registerDestructor } from '@ember/destroyable';

export default class RelativeTimeHelper extends Helper {
  disableInterval = false;

  constructor(...args) {
    super(...args);

    registerDestructor(this, this.clearTimer.bind(this));
  }

  compute(params, { interval, addSuffix, locale }) {
    if (this.disableInterval) {
      return;
    }

    this.clearTimer();

    if (interval) {
      /*
       * NOTE: intentionally a setTimeout so tests do not block on it
       * as the run loop queue is never clear so tests will stay locked waiting
       * for queue to clear.
       */
      this.intervalTimer = setTimeout(() => {
        run(() => this.recompute());
      }, parseInt(interval, 10));
    }

    return formatDistanceToNowStrict(params[0], { addSuffix, locale: locales[locale] });
  }

  clearTimer() {
    clearTimeout(this.intervalTimer);
  }
}
