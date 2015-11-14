import { moduleFor, test } from 'ember-qunit';

moduleFor('route:file', 'Unit | Route | file', {
  needs: ['service:websockets']
});

test('it exists', function(assert) {
  var route = this.subject();
  assert.ok(route);
});
