import moment from 'moment';

moment.updateLocale('en', {
  relativeTime : {
    future: "in %s",
    past:   "%s ago",
    s:  "a moment",
    m:  "a min",
    mm: "%d mins",
    h:  "an hour",
    hh: "%d hours",
    d:  "a day",
    dd: "%d days",
    M:  "a month",
    MM: "%d months",
    y:  "a year",
    yy: "%d years"
  }
});

moment.locale('en-short', {
  relativeTime : {
    future: "in %s",
    past:   "%s ago",
    s:  "now",
    m:  "a min",
    mm: "%d min",
    h:  "an hour",
    hh: "%d h",
    d:  "a day",
    dd: "%d d",
    M:  "a mo",
    MM: "%d mo",
    y:  "a y",
    yy: "%d y"
  }
});

export default {};
