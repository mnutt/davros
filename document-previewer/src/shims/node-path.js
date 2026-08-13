export function basename(path) {
  return path.split(/[\\/]/).pop() ?? path;
}

export function dirname(path) {
  const normalized = path.replace(/\\/g, '/');
  const index = normalized.lastIndexOf('/');
  return index === -1 ? '.' : normalized.slice(0, index) || '/';
}

export function resolve(...parts) {
  return parts.filter(Boolean).join('/');
}
