import { helper } from '@ember/component/helper';

export default helper(function and(values) {
  return values.every(Boolean);
});
