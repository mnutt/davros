const files = new Map();

export function registerFileBytes(path, bytes) {
  const value = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const copy = new Uint8Array(value);

  files.set(path, copy);
  files.set(basename(path), copy);
}

export function existsSync(path) {
  return files.has(path) || files.has(basename(path));
}

export function readFileSync(path) {
  const bytes = files.get(path) ?? files.get(basename(path));

  if (!bytes) {
    throw new Error(`node:fs readFileSync could not resolve ${path} in the browser previewer`);
  }

  return new Uint8Array(bytes);
}

function basename(path) {
  return path.split(/[\\/]/).pop() ?? path;
}
