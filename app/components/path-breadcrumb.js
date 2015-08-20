import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['breadcrumb'],

  parts: function() {
    var pieces = this.get('path').split('/');
    var p = [];

    if(pieces.join('') === '') {
      return [];
    }

    for(var i = 0; i < pieces.length - 1; i++) {
      var path = pieces.slice(0, i + 1).join('/');
      var part = Ember.Object.create({
        name: pieces[i],
        path: path
      });

      p.push(part);
    }

    return p;
  }.property('path')
});
