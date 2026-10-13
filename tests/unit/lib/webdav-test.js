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

  test('encodes every outgoing file path exactly once', async function (assert) {
    const client = new WebdavClient('/dav');
    const path = '/Pass & Seymour/#1 + notes?.docx';
    const encoded = '/dav/Pass%20%26%20Seymour/%231%20%2B%20notes%3F.docx';
    assert.strictEqual(client.fullPath(path), encoded);
    assert.strictEqual(client.fullPath(encoded.slice(4)), encoded);
    globalThis.fetch = (url, options) => {
      assert.strictEqual(url, encoded);
      assert.true(options.headers.Destination.endsWith('/dav/Renamed%20%26%20file.docx'));
      return Promise.resolve(new Response(null, { status: 204 }));
    };
    await client.move(path, '/Renamed & file.docx');
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
