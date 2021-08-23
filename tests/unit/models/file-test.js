import { module, test } from 'qunit';
import File from 'davros/models/file';

module('Unit | Model | file', function () {
  test('parent is one directory higher', function (assert) {
    const model = new File({ path: '/foo/bar/baz' });
    assert.equal(model.parent, '/foo/bar');
  });

  test('linkedPath has trailing slash when object is directory', function (assert) {
    const model = new File({ isDirectory: true, path: '/foo' });
    assert.equal(model.linkedPath, '/foo/');
  });

  test('linkedPath has no trailing slash when object is a file', function (assert) {
    const model = new File({ isDirectory: false, path: '/foo.png' });
    assert.equal(model.linkedPath, '/foo.png');
  });

  test('isDirectory is true when mode is directory-like', function (assert) {
    const model = new File({ isDirectory: true });
    assert.true(model.isDirectory);
  });

  test('isDirectory is true when mode is not directory-like', function (assert) {
    const model = new File({ isDirectory: false });
    assert.false(model.isDirectory);
  });

  test('extension returns file extension when there is one', function (assert) {
    const model = new File({ path: '/path/to/foo.png' });
    assert.equal(model.extension, 'png');
  });

  test('extension returns empty string when there is no extension', function (assert) {
    const model = new File({ path: '/path/to/foo' });
    assert.equal(model.extension, '');
  });

  test('extension returns extension when there are multiple dots', function (assert) {
    const model = new File({ path: '/path/to/foo.bar.png' });
    assert.equal(model.extension, 'png');
  });
});
