import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

export default helper(function filesize([value]) {
  if (typeof value === 'undefined' || value === null) {
    return null;
  }

  let size = Number(value);
  if (Number.isNaN(size)) {
    return null;
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  for (let i = 0; i < units.length; i++) {
    if (size < 1024) {
      return htmlSafe(`${Math.floor(size)}<span>${units[i]}</span>`);
    }
    size /= 1024;
  }

  return htmlSafe(`${Math.floor(size)}<span>${units[units.length - 1]}</span>`);
});
