import locale from 'date-fns/locale/en-US'

const formatDistanceLocaleShort = {
  lessThanXSeconds: 'now',
  xSeconds: 'now',
  halfAMinute: 'now',
  lessThanXMinutes: '{{count}} min',
  xMinutes: '{{count}} min',
  aboutXHours: '{{count}} h',
  xHours: '{{count}} h',
  xDays: '{{count}} d',
  aboutXWeeks: '{{count}} w',
  xWeeks: '{{count}} w',
  aboutXMonths: '{{count}} mo',
  xMonths: '{{count}} mo',
  aboutXYears: '{{count}} y',
  xYears: '{{count}} y',
  overXYears: '{{count}} y',
  almostXYears: '{{count}} y',
}

function formatDistanceShort(token, count, options) {
  options = options || {}

  const result = formatDistanceLocaleShort[token].replace('{{count}}', count)

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return 'in ' + result
    } else {
      return result + ' ago'
    }
  }

  return result
}

const formatDistanceLocale = {
  lessThanXSeconds: 'a moment',
  xSeconds: 'a moment',
  halfAMinute: '30s ago',
  lessThanXMinutes: '< {{count}} min',
  xMinutes: '{{count}} min',
  aboutXHours: {
    one: '~1 hour',
    other: '~{{count}} hours',
  },
  xHours: {
    one: '1 hour',
    other: '{{count}} hours',
  },
  xDays: {
    one: '1 day',
    other: '{{count}} days',
  },
  aboutXWeeks: {
    one: '~1 week',
    other: '~{{count}} weeks',
  },
  xWeeks: {
    one: '1 week',
    other: '{{count}} weeks',
  },
  aboutXMonths: {
    one: '~1 month',
    other: '~{{count}} months',
  },
  xMonths: {
    one: '1 month',
    other: '{{count}} months',
  },
  aboutXYears: {
    one: '~1 year',
    other: '~{{count}} years',
  },
  xYears: {
    one: '1 year',
    other: '{{count}} years',
  },
  overXYears: {
    one: '> 1 year',
    other: '> {{count}} years',
  },
  almostXYears: {
    one: '1 year',
    other: '{{count}} years',
  }
}

function formatDistance(token, count, options) {
  options = options || {}

  var result
  if (typeof formatDistanceLocale[token] === 'string') {
    result = formatDistanceLocale[token].replace('{{count}}', count);
  } else if (count === 1) {
    result = formatDistanceLocale[token].one;
  } else {
    result = formatDistanceLocale[token].other.replace('{{count}}', count);
  }

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return 'in ' + result
    } else {
      return result + ' ago'
    }
  }

  return result
}


const enShortLocale = { ...locale, formatDistance: formatDistanceShort };
const enLocale = { ...locale, formatDistance };

export { enLocale, enShortLocale };

export default { 'en': enLocale, 'en-short': enShortLocale };
