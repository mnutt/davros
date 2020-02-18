import $ from 'jquery';
import { computed } from '@ember/object';
import Component from '@ember/component';

const base = '/api/thumbnail?';

export default Component.extend({
  tagName: 'img',
  attributeBindings: ['src', 'width', 'height', 'alt'],

  cachebuster: computed('timestamp', function() {
    let timestamp = this.get('timestamp');
    if(timestamp.getTime) {
      return timestamp.getTime();
    } else {
      return timestamp.toString();
    }
  }),

  src: computed('original', function() {
    return base + $.param({
      url:    this.get('original'),
      width:  this.get('width'),
      height: this.get('height'),
      op:     this.get('op') || 'fit',
      ts:     this.get('cachebuster')
    });
  })
});
