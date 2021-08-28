import { find, click, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { selectFiles } from 'ember-file-upload/test-support';
import { makeImage } from '../helpers/upload';
import { makeAndEnterNewDirectory, reload } from '../helpers/directory';
import { mp4File } from '../fixtures/files';

module('Acceptance | display files', function (hooks) {
  setupApplicationTest(hooks);

  test('viewing an image', async function (assert) {
    const directory = await makeAndEnterNewDirectory();
    assert.equal(currentURL(), `/files/${directory}/`);

    await selectFiles('input[type="file"]', await makeImage('my-image.png'));
    await reload();

    assert.dom('.filename').hasText('my-image.png');

    await click('[href*="my-image.png"]');

    find('.parent-only').remove(); // not in mobile view
    assert.dom('.title').hasText(`Viewing home / ${directory} / my-image.png`);

    // image is shown
    assert.dom('.preview img').hasAttribute('src', `/dav/${directory}/my-image.png`);
    assert.dom('.updated').hasText('Updated a moment ago');

    const size = find('.size').innerText;
    assert.ok(parseInt(size) > 1);
  });

  test('viewing a video', async function (assert) {
    const directory = await makeAndEnterNewDirectory();
    assert.equal(currentURL(), `/files/${directory}/`);

    await selectFiles('input[type="file"]', mp4File);
    await reload();

    assert.dom('.filename .truncate').hasText('video.mp4');

    await click('[href*="video.mp4"]');

    // video is shown
    assert.dom('.preview video').hasAttribute('src', `/dav/${directory}/video.mp4`);
    assert.dom('.updated').hasText('Updated a moment ago');

    assert.dom('.size').hasText('265B');
  });
});
