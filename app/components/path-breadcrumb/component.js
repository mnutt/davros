import { computed } from '@ember/object';
import EmberObject from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
  classNames: ['breadcrumb'],

  parts: computed('path', function() {
    var pieces = (this.path || '').split('/');
    var p = [];

    if (pieces.join('') === '') {
      return [];
    }

    // is a directory
    if (pieces[pieces.length - 1] === '') {
      pieces.pop();
    }

    for (var i = 0; i < pieces.length - 1; i++) {
      var path = pieces.slice(0, i + 1).join('/');
      if (i !== pieces.length - 1) {
        path += '/';
      }
      var part = EmberObject.create({
        name: pieces[i],
        path: path
      });

      p.push(part);
    }

    return p;
  }),

  isHome: computed('path', function() {
    return this.path === '/';
  }),

  parentPath: computed('parts', function() {
    return this.get('parts.lastObject.path') || '/';
  })
});
