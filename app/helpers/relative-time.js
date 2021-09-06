import { run } from '@ember/runloop';
import Helper from '@ember/component/helper';
import { formatDistanceToNowStrict } from 'date-fns';
import locales from '../lib/date-locales';
import { registerDestructor } from '@ember/destroyable';

const MILLISECONDS_IN_MINUTES = 1000 * 60;
const MINUTES_IN_DAY = 60 * 24;
const MINUTES_IN_MONTH = MINUTES_IN_DAY * 30;
const MINUTES_IN_YEAR = MINUTES_IN_DAY * 365;

const roundingMethodFn = Math.round;

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

    return formatDistanceToNow(params[0], { addSuffix, locale: locales[locale] });
  }

  clearTimer() {
    clearTimeout(this.intervalTimer);
  }
}

function formatDistanceToNow(fromDate, { addSuffix, locale }) {
  const nowDate = new Date();

  // If date is in the future, just say it's now
  const milliseconds = Math.max(0, nowDate - fromDate);
  const minutes = milliseconds / MILLISECONDS_IN_MINUTES;

  let unit;

  if (minutes < 1) {
    unit = 'second';
  } else if (minutes < 60) {
    unit = 'minute';
  } else if (minutes < MINUTES_IN_DAY) {
    unit = 'hour';
  } else if (minutes < MINUTES_IN_MONTH) {
    unit = 'day';
  } else if (minutes < MINUTES_IN_YEAR) {
    unit = 'month';
  } else {
    unit = 'year';
  }

  const localizeOptions = { addSuffix };

  if (unit === 'second') {
    var seconds = roundingMethodFn(milliseconds / 1000);
    return locale.formatDistance('xSeconds', seconds, localizeOptions); // 1 up to 60 mins
  } else if (unit === 'minute') {
    var roundedMinutes = roundingMethodFn(minutes);
    return locale.formatDistance('xMinutes', roundedMinutes, localizeOptions); // 1 up to 24 hours
  } else if (unit === 'hour') {
    var hours = roundingMethodFn(minutes / 60);
    return locale.formatDistance('xHours', hours, localizeOptions); // 1 up to 30 days
  } else if (unit === 'day') {
    var days = roundingMethodFn(minutes / MINUTES_IN_DAY);
    return locale.formatDistance('xDays', days, localizeOptions); // 1 up to 12 months
  } else if (unit === 'month') {
    var months = roundingMethodFn(minutes / MINUTES_IN_MONTH);
    return months === 12
      ? locale.formatDistance('xYears', 1, localizeOptions)
      : locale.formatDistance('xMonths', months, localizeOptions); // 1 year up to max Date
  } else if (unit === 'year') {
    var years = roundingMethodFn(minutes / MINUTES_IN_YEAR);
    return locale.formatDistance('xYears', years, localizeOptions);
  }
}
