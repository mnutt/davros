import { module, test } from 'qunit';
import { encodePath } from 'davros/lib/path-encoding';

module('Unit | Lib | path encoding', function () {
  test('encodes path segments while preserving separators', function (assert) {
    assert.strictEqual(encodePath('test dir/file name.txt'), 'test%20dir/file%20name.txt');
  });

  test('does not double-encode existing encoded segments', function (assert) {
    assert.strictEqual(encodePath('test%20dir/file%20name.txt'), 'test%20dir/file%20name.txt');
  });
});
