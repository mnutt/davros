import Ember from 'ember';
import pathSignature from '../../lib/path-signature';

export default Ember.Component.extend({
  src: null,

  didInsertElement() {
    pathSignature(this.get('model.rawPath')).then((path) => {
      this.set('src', path);
    });
  }
});
