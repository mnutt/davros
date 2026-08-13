import { module, test } from 'qunit';
import WebdavClient from 'davros/lib/webdav';

module('Unit | Lib | webdav', function (hooks) {
  let originalFetch;

  hooks.beforeEach(function () {
    originalFetch = globalThis.fetch;
  });

  hooks.afterEach(function () {
    globalThis.fetch = originalFetch;
  });

  test('remove resolves after a successful response', async function (assert) {
    const response = new Response(null, { status: 204 });
    globalThis.fetch = () => Promise.resolve(response);

    const result = await new WebdavClient('/dav').remove('/photo.jpg');

    assert.strictEqual(result, response);
  });

  test('remove rejects a failed response', async function (assert) {
    globalThis.fetch = () =>
      Promise.resolve(new Response(null, { status: 500, statusText: 'Internal Server Error' }));

    await assert.rejects(
      new WebdavClient('/dav').remove('/photo.jpg'),
      /Delete failed \(500 Internal Server Error\)/,
    );
  });

  test('remove rejects a missing file response', async function (assert) {
    globalThis.fetch = () =>
      Promise.resolve(new Response(null, { status: 404, statusText: 'Not Found' }));

    await assert.rejects(
      new WebdavClient('/dav').remove('/photo.jpg'),
      /Delete failed \(404 Not Found\)/,
    );
  });
});
