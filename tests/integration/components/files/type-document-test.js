import { click, find, render, settled } from '@ember/test-helpers';
import { precompileTemplate } from '@ember/template-compilation';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import File from 'davros/models/file';

const template = precompileTemplate('<Files::TypeDocument @model={{this.model}} />', {
  moduleName: 'tests/integration/components/files/type-document-test.hbs',
});

module('Integration | Component | files/type-document', function (hooks) {
  setupRenderingTest(hooks);

  test('refreshes an active preview when the model revision changes', async function (assert) {
    this.set('model', new File({ path: '/report.docx', mtime: new Date(1) }));

    await render(template);
    await click('button');
    const initialPreviewUrl = find('iframe[title="WASM Document Preview"]').getAttribute('src');

    this.model.mtime = new Date(2);
    await settled();

    assert.dom('iframe[title="WASM Document Preview"]').exists();
    assert.notEqual(
      find('iframe[title="WASM Document Preview"]').getAttribute('src'),
      initialPreviewUrl,
      'updated revision starts a new preview session'
    );
  });

  test('resets preview state when the component receives another model', async function (assert) {
    this.set('model', new File({ path: '/first.docx', mtime: new Date(1) }));

    await render(template);
    await click('button');
    assert.dom('iframe[title="WASM Document Preview"]').exists();

    this.set('model', new File({ path: '/second.docx', mtime: new Date(1) }));
    await settled();

    assert.dom('button span').hasText('Preview Document');
    assert.dom('iframe').doesNotExist();
  });
});
