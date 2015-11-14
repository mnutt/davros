import { moduleForModel, test } from 'ember-qunit';

moduleForModel('file', 'Unit | Model | file', {
  // Specify the other units that are required for this test.
  needs: []
});

test('parent is one directory higher', function(assert) {
  var model = this.subject({path: '/foo/bar/baz'});
  assert.equal(model.get('parent'), '/foo/bar');
});

test('linkedPath has trailing slash when object is directory', function(assert) {
  var model = this.subject({isDirectory: true, path: '/foo'});
  assert.equal(model.get('linkedPath'), '/foo/');
});

test('linkedPath has no trailing slash when object is a file', function(assert) {
  var model = this.subject({isDirectory: false, path: '/foo.png'});
  assert.equal(model.get('linkedPath'), '/foo.png');
});

test('isDirectory is true when mode is directory-like', function(assert) {
  var model = this.subject({mode: 16384});
  assert.equal(model.get('isDirectory'), true);
});

test('isDirectory is true when mode is not directory-like', function(assert) {
  var model = this.subject({mode: 500});
  assert.equal(model.get('isDirectory'), false);
});

test('extension returns file extension when there is one', function(assert) {
  var model = this.subject({name: 'foo.png'});
  assert.equal(model.get('extension'), 'png');
});

test('extension returns empty string when there is no extension', function(assert) {
  var model = this.subject({name: 'foo'});
  assert.equal(model.get('extension'), '');
});

test('extension returns extension when there are multiple dots', function(assert) {
  var model = this.subject({name: 'foo.bar.png'});
  assert.equal(model.get('extension'), 'png');
});
