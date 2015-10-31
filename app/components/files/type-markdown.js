import Base from './base';
import jQuery from 'jquery';

export default Base.extend({
  rawContent: 'Loading...',

  didInsertElement: function() {
    this._super.call(this);
    var self = this;
    return jQuery.ajax({
      url: this.get('model.rawPath')
    }).then(function(response) {
      self.set('rawContent', response);
    });
  }
});
