export function encodePath(path = '') {
  return String(path)
    .split('/')
    .map((segment) => {
      if (segment === '') {
        return '';
      }

      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch (_error) {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}
