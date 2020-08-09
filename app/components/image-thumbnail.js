import { computed } from '@ember/object';
import Component from '@ember/component';

const base = '/api/thumbnail?';

export default Component.extend({
  tagName: 'img',
  attributeBindings: ['src', 'alt'],

  cachebuster: computed('timestamp', function() {
    let timestamp = this.timestamp;
    if (timestamp.getTime) {
      return timestamp.getTime();
    } else {
      return timestamp.toString();
    }
  }),

  src: computed('original', function() {
    return (
      base +
      Object.entries({
        url: this.original,
        width: this.width,
        height: this.height,
        op: this.op || 'fit',
        ts: this.cachebuster
      })
        .map(p => p.map(encodeURIComponent).join('='))
        .join('&')
    );
  })
});
