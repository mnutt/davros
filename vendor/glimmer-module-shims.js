/* global define */

function reExport(exports, source) {
  Object.keys(source).forEach(function (key) {
    if (key !== 'default') {
      exports[key] = source[key];
    }
  });
}

define('@glimmer/runtime', ['exports', 'ember-source/@glimmer/runtime'], function (
  exports,
  runtime
) {
  reExport(exports, runtime);
});

define('@glimmer/validator', ['exports', 'ember-source/@glimmer/validator'], function (
  exports,
  validator
) {
  reExport(exports, validator);
});

define('@glimmer/reference', ['exports', 'ember-source/@glimmer/reference'], function (
  exports,
  reference
) {
  reExport(exports, reference);
});

define('@glimmer/destroyable', ['exports', 'ember-source/@glimmer/destroyable'], function (
  exports,
  destroyable
) {
  reExport(exports, destroyable);
});
