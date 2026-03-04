import { modifier } from 'ember-modifier';

export default modifier(function onDestroy(element, [callback, ...args]) {
  return () => {
    if (typeof callback === 'function') {
      callback(element, ...args);
    }
  };
});
