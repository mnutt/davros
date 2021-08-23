'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'script',
  },
  env: {
    browser: false,
    node: true,
  },
  plugins: ['node'],
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  rules: {
    // this can be removed once the following is fixed
    // https://github.com/mysticatea/eslint-plugin-node/issues/77
    'node/no-unpublished-require': 'off',
  },
};
