import { helper } from '@ember/component/helper';
import { set, get } from '@ember/object';

export function toggle([obj, prop]) {
  return function() {
    set(obj, prop, !get(obj, prop));
  };
}

export default helper(toggle);
