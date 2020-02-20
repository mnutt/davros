import { helper as buildHelper } from '@ember/component/helper';

export default buildHelper(function(value) {
  if (typeof value === 'undefined') {
    return null;
  }

  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
});
