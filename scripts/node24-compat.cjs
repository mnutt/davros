'use strict';

// Compatibility shim for older Ember/Broccoli plugins running on Node 24+.
const util = require('node:util');
const types = require('node:util/types');

if (typeof util.isRegExp !== 'function') {
  util.isRegExp = types.isRegExp;
}

if (typeof util.isDate !== 'function') {
  util.isDate = (value) => types.isDate(value);
}

if (typeof util.isError !== 'function') {
  util.isError = (value) => value instanceof Error || types.isNativeError(value);
}
