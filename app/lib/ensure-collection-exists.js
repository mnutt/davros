import Webdav from 'davros/lib/webdav';
import Ember from 'ember';

var pathsCompleted = {};

export default function(path) {
  return new Ember.RSVP.Promise(function(resolve) {
    var parts = path.replace(/^\//, '').split('/');
    if(parts.length < 2) {
      return resolve();
    }

    parts.pop(); // don't care about the actual file

    let dirs = parts.map(function(part, index) {
      return Webdav.base + '/' + parts.slice(0, index + 1).join('/');
    });

    dirs.reduce(function(cur, next) {
      return cur.then(function() {
        // If there is an existing in-flight promise, return that instead
        return pathsCompleted[next] || (pathsCompleted[next] = Webdav.mkcol(next));
      });
    }, Ember.RSVP.resolve()).then(function() {
      resolve();
    });
  });
}
