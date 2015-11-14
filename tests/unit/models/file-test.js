import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';

moduleForModel('file', 'Unit | Model | file', {
  // Specify the other units that are required for this test.
  needs: []
});

test('parent is one directory higher', function(assert) {
  var model = this.subject();
  Ember.run(function() {
  model.set('path', '/foo/bar/baz');
    assert.equal(model.get('parent'), '/foo/bar');
  });
});
