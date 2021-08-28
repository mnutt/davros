import { click, currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { makeDirectory, makeAndEnterNewDirectory } from 'davros/tests/helpers/directory';

module('Acceptance | list files', function (hooks) {
  setupApplicationTest(hooks);

  test('redirecting root to /files', async function (assert) {
    await visit('/');

    assert.equal(currentURL(), '/files');
  });

  test('listing files', async function (assert) {
    const baseDir = await makeAndEnterNewDirectory();

    const dir1 = await makeDirectory();
    const dir2 = `z~$#@!^&*()å¶$`;
    await makeDirectory(dir2);

    assert.dom('.file-list tr:nth-child(1) .filename .truncate').hasText(dir1);
    assert.dom('.file-list tr:nth-child(2) .filename .truncate').hasText(dir2);

    await click('.file-list tr:nth-child(2) .filename');

    assert.equal(currentURL(), `/files/${baseDir}/z~$%23@!%5E&*()%C3%A5%C2%B6$/`);

    find('.parent-only').remove();
    assert.dom('.title').hasText(`Files in home / ${baseDir} / ${dir2} /`);
  });
});
