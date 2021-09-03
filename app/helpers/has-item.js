import { helper } from '@ember/component/helper';

export function hasItem(item, weakSet) {
  return weakSet.has(item);
}

export default helper(function ([item, weakSet]) {
  return hasItem(item, weakSet);
});
