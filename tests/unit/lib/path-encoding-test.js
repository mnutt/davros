import { module, test } from 'qunit';
import { encodePath, encodeRoutePath } from 'davros/lib/path-encoding';

module('Unit | Lib | path encoding', function () {
  test('encodes path segments while preserving separators', function (assert) {
    assert.strictEqual(encodePath('test dir/file name.txt'), 'test%20dir/file%20name.txt');
  });

  test('does not double-encode existing encoded segments', function (assert) {
    assert.strictEqual(encodePath('test%20dir/file%20name.txt'), 'test%20dir/file%20name.txt');
  });

  test('encodes filename delimiters and preserves router query and fragment syntax', function (assert) {
    const file = '26 27 26 Wiring Devices - Pass & Seymour Revd9 05-02-26.docx';
    const path = `/files/${encodeURIComponent(file)}`;
    assert.strictEqual(encodeRoutePath(`/files/${file}`), path);
    assert.strictEqual(encodeRoutePath(path), path);
    assert.strictEqual(
      encodeRoutePath(`${path}?sort=name&direction=asc#preview`),
      `${path}?sort=name&direction=asc#preview`,
    );
    assert.strictEqual(
      encodePath('/100% done/#1 + notes?.docx'),
      '/100%25%20done/%231%20%2B%20notes%3F.docx',
    );
  });
});
