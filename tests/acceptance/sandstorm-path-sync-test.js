import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { makeAndEnterNewDirectory } from '../helpers/directory';

module('Acceptance | sandstorm path sync', function (hooks) {
  setupApplicationTest(hooks);

  test('posts setPath message when navigating', async function (assert) {
    assert.expect(2);

    let calls = [];
    let originalPostMessage = window.parent.postMessage;

    window.parent.postMessage = function (message, targetOrigin) {
      calls.push({ message, targetOrigin });
      return originalPostMessage.call(this, message, targetOrigin);
    };

    try {
      const directory = await makeAndEnterNewDirectory();
      await visit(`/files/${directory}/`);
      await visit('/clients');

      assert.true(
        calls.some((call) => call.message?.setPath === `/files/${directory}/`),
        'posted directory path to Sandstorm host'
      );
      assert.true(
        calls.some((call) => call.message?.setPath === '/clients'),
        'posted clients path to Sandstorm host'
      );
    } finally {
      window.parent.postMessage = originalPostMessage;
    }
  });
});
