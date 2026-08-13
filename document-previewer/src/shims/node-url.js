export function fileURLToPath(url) {
  const value = String(url);

  if (value.startsWith('file://')) {
    return decodeURIComponent(new URL(value).pathname);
  }

  return value;
}
