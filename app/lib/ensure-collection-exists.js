import { resolve } from 'rsvp';

var pathsCompleted = {};

export default function (path, client) {
  var parts = path.replace(/^\//, '').split('/');
  if (parts.length < 2) {
    return resolve();
  }

  parts.pop(); // don't care about the actual file

  let dirs = parts
    .map(function (part, index) {
      return parts.slice(0, index + 1).join('/');
    })
    .filter((d) => d.length);

  return dirs.reduce(function (cur, next) {
    return cur.then(function () {
      // If there is an existing in-flight promise, return that instead.
      // Evict the cache entry on failure so a transient error doesn't poison
      // this path for the rest of the session (mkcol can now reject).
      return (
        pathsCompleted[next] ||
        (pathsCompleted[next] = client.mkcol(next).catch(function (err) {
          delete pathsCompleted[next];
          throw err;
        }))
      );
    });
  }, resolve());
}
