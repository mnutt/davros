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

// Router URLs can contain a query or fragment; only normalize the pathname.
// Sandstorm receives this as a URL path, not as an already-encoded query value.
export function encodeRoutePath(url = '/') {
  const separator = url.search(/[?#]/);
  return separator === -1
    ? encodePath(url)
    : encodePath(url.slice(0, separator)) + url.slice(separator);
}
