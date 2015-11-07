import moment from 'moment';

moment.locale('en', {
  relativeTime : {
    future: "in %s",
    past:   "%s ago",
    s:  "just now",
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
