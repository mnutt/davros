import { helper } from '@ember/component/helper';

export default helper(function not([value]) {
  return !value;
});
