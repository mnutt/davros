/* global define */
define('@glimmer/manager', ['exports', 'ember-source/@glimmer/manager'], function (
  exports,
  manager
) {
  Object.keys(manager).forEach(function (key) {
    if (key !== 'default') {
      exports[key] = manager[key];
    }
  });
});
