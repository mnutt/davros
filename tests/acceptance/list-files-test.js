import { test } from 'qunit';
import fileStub from 'davros/tests/helpers/file-stub';
import moduleForAcceptance from 'davros/tests/helpers/module-for-acceptance';

var stub;

function stripTitle(text) {
  return text.replace(/\s+/g, ' ').trim();
}

moduleForAcceptance('Acceptance | list files', {
  beforeEach: function() {
    stub = fileStub();

    stub.get('/api/permissions', function() {
      return [404, {}, ''];
    });
  },

  afterEach: function() {
    stub.shutdown();
  }
});

test('redirecting root to /files', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/files/');
  });
});

test('listing files', function(assert) {
  visit('/files/');

  andThen(function() {
    assert.equal(find('.file-list tr:nth-child(1) .filename .truncated').text(), 'myDir');
    assert.equal(find('.file-list tr:nth-child(2) .filename .truncated').text(), 'space.jpg');
  });
});

test('traversing directories', function(assert) {
  visit('/files/');
  click('div.filename div:contains(myDir)');

  andThen(function() {
    find('.parent-only').remove(); // not in mobile view

    // title looks good
    assert.equal(stripTitle(find('.title').text()), 'Files in home / myDir /');
    // first file in subdir exists
    assert.equal(find('.file-list tr:nth-child(1) .filename .truncated').text(), 'ios-davros.png');
  });

  click('a:contains(home)');

  andThen(function() {
    find('.parent-only').remove();
    assert.equal(stripTitle(find('.title').text()), 'Files in home /');
  });
});
