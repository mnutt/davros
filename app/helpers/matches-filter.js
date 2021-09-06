import { helper } from '@ember/component/helper';

export function matchesFilter(node, filter) {
  if (!filter) {
    return true;
  }

  if (typeof filter.isDirectory !== 'undefined') {
    return node.isDirectory === filter.isDirectory;
  }

  return true;
}

export default helper(function ([node, filter]) {
  return matchesFilter(node, filter);
});
