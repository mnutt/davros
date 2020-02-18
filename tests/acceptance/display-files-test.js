import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import fileStub from 'davros/tests/helpers/file-stub';

var stub;

function stripTitle(text) {
  return text.replace(/\s+/g, ' ').trim();
}

module('Acceptance | display files', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    stub = fileStub();

    stub.get('/api/permissions', function() {
      return [404, {}, ''];
    });

    stub.get('/api/publish/info', function() {
      return [200, {}, '{}'];
    });
  });

  hooks.afterEach(function() {
    stub.shutdown();
  });

  test('viewing an image', async function(assert) {
    await visit('/files/');

    await click('div.filename div:contains(space)');

    find('.parent-only').remove(); // not in mobile view

    // title looks good
    assert.equal(stripTitle(find('.title').text()), 'Viewing home / space.jpg');

    // image is shown
    assert.equal(find('.preview img').attr('src'), '/remote.php/webdav/space.jpg');
  });
});
