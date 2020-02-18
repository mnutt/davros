import { click, currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import fileStub from 'davros/tests/helpers/file-stub';

var stub;

function stripTitle(text) {
  return text.replace(/\s+/g, ' ').trim();
}

module('Acceptance | list files', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    stub = fileStub();

    stub.get('/api/permissions', function() {
      return [404, {}, ''];
    });
  });

  hooks.afterEach(function() {
    stub.shutdown();
  });

  test('redirecting root to /files', async function(assert) {
    await visit('/');

    assert.equal(currentURL(), '/files');
  });

  test('listing files', async function(assert) {
    await visit('/files');

    assert.dom('.file-list tr:nth-child(1) .filename .truncated').hasText('myDir');
    assert.dom('.file-list tr:nth-child(2) .filename .truncated').hasText('space.jpg');
  });

  test('traversing directories', async function(assert) {
    await visit('/files');
    await click('div.filename div:contains(myDir)');

    find('.parent-only').remove(); // not in mobile view

    // title looks good
    assert.equal(stripTitle(find('.title').textContent), 'Files in home / myDir /');
    // first file in subdir exists
    assert.dom('.file-list tr:nth-child(1) .filename .truncated').hasText('ios-davros.png');

    await click('a:contains(home)');

    find('.parent-only').remove();
    assert.equal(stripTitle(find('.title').textContent), 'Files in home /');
  });
});
