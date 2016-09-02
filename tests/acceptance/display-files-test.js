import { test } from 'qunit';
import fileStub from 'davros/tests/helpers/file-stub';
import moduleForAcceptance from 'davros/tests/helpers/module-for-acceptance';

var stub;

function stripTitle(text) {
  return text.replace(/\s+/g, ' ').trim();
}

moduleForAcceptance('Acceptance | display files', {
  beforeEach: function() {
    stub = fileStub();

    stub.get('/api/permissions', function() {
      return [404, {}, ''];
    });

    stub.get('/api/publish/info', function() {
      return [200, {}, '{}'];
    });
  },

  afterEach: function() {
    stub.shutdown();
  }
});

test('viewing an image', function(assert) {
  visit('/files/');

  click('div.filename div:contains(space)');

  andThen(function() {
    find('.parent-only').remove(); // not in mobile view

    // title looks good
    assert.equal(stripTitle(find('.title').text()), 'Viewing home / space.jpg');

    // image is shown
    assert.equal(find('.preview img').attr('src'), '/remote.php/webdav/space.jpg');
  });
});
