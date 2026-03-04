import { helper } from '@ember/component/helper';

export default helper(function or(values) {
  return values.some(Boolean);
});
