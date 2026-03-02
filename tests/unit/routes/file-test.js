import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | file', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const route = this.owner.lookup('route:file');
    assert.ok(route);
  });

  test('normalizePath trims leading and trailing slashes', function(assert) {
    const route = this.owner.lookup('route:file');

    assert.strictEqual(route.normalizePath('/test%20dir/'), 'test%20dir');
    assert.strictEqual(route.normalizePath('/'), '');
  });
});
