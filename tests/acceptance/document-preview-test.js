import { click, find, visit, waitUntil } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import fixtures from '../fixtures/document-preview';

module('Acceptance | server document preview', function (hooks) {
  setupApplicationTest(hooks);

  for (const kind of ['docx', 'pptx', 'xlsx']) {
    test(`${kind} loads a server-converted PDF`, async function (assert) {
      const name = `Pass & Seymour #1 + ${kind} notes.${kind}`;
      const bytes = Uint8Array.from(atob(fixtures[kind]), (char) => char.charCodeAt(0));
      const uploaded = await fetch(`/dav/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: bytes,
      });
      assert.true(uploaded.ok);
      await visit(`/files/${encodeURIComponent(name)}`);
      await click('.preview button');
      await waitUntil(() => find('iframe[title="Document Preview"]') || find('[role="alert"]'), {
        timeout: 15000,
      });
      const frame = find('iframe[title="Document Preview"]');
      assert.ok(frame, 'PDF frame is displayed');
      const response = await fetch(frame.getAttribute('src'));
      assert.strictEqual(response.headers.get('content-type'), 'application/pdf');
      const pdf = new Uint8Array(await response.arrayBuffer());
      assert.strictEqual(new TextDecoder().decode(pdf.slice(0, 5)), '%PDF-');
    });
  }
});
