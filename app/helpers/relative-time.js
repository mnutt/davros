import { run } from '@ember/runloop';
import Helper from '@ember/component/helper';
import { get, observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { formatDistanceToNowStrict } from 'date-fns';
import locales from '../lib/date-locales';

export default Helper.extend({
  disableInterval: false,

  compute(params, { interval, addSuffix, locale }) {
    if (this.disableInterval) { return; }

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
  },

  clearTimer() {
    clearTimeout(this.intervalTimer);
  },

  destroy() {
    this.clearTimer();
    this._super(...arguments);
  }
});
