import { modifier } from 'ember-modifier';

export default modifier(function onInsert(element, [callback, ...args]) {
  if (typeof callback === 'function') {
    callback(element, ...args);
  }
});
