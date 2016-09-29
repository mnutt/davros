import Ember from 'ember';

const base = '/api/thumbnail?';

export default Ember.Component.extend({
  tagName: 'img',
  attributeBindings: ['src', 'width', 'height', 'alt'],

  cachebuster: Ember.computed('timestamp', function() {
    let timestamp = this.get('timestamp');
    if(timestamp.getTime) {
      return timestamp.getTime();
    } else {
      return timestamp.toString();
    }
  }),

  src: Ember.computed('original', function() {
    return base + Ember.$.param({
      url:    this.get('original'),
      width:  this.get('width'),
      height: this.get('height'),
      op:     this.get('op') || 'fit',
      ts:     this.get('cachebuster')
    });
  })
});
