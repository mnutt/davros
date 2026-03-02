import { helper } from '@ember/component/helper';

export default helper(function gt([left, right]) {
  return left > right;
});
