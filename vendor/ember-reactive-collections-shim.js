/* global define */
define(
  '@ember/reactive/collections',
  ['exports', 'ember-source/@ember/reactive/collections'],
  function (exports, reactiveCollections) {
    Object.keys(reactiveCollections).forEach(function (key) {
      if (key !== 'default') {
        exports[key] = reactiveCollections[key];
      }
    });
  }
);
