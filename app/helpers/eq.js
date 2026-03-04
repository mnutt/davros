import { helper } from '@ember/component/helper';

export default helper(function eq([left, right]) {
  return left === right;
});
