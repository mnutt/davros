import { module, test } from 'qunit';
import File from '../../../app/models/file';

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

  test('refreshing an empty directory clears its previous children', async function (assert) {
    const model = new File({
      isDirectory: true,
      path: '/examples',
      files: [new File({ path: '/examples/photo.jpg' })],
    });

    await model.setPropertiesFromItems([]);

    assert.deepEqual(model.files, []);
  });

  for (const extension of ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp']) {
    test(`${extension} files use the server document previewer`, function (assert) {
      for (const suffix of [extension, extension.toUpperCase()]) {
        const model = new File({ path: `/path/to/foo.${suffix}` });
        assert.equal(model.documentPreviewKind, 'server', suffix);
        assert.equal(model.type, 'document', suffix);
      }
    });
  }

  test('PDF files do not use the document previewer', function (assert) {
    assert.equal(new File({ path: '/path/to/foo.pdf' }).documentPreviewKind, null);
  });
});
