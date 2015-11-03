import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement: function() {
    this.$(".preview").height(this.$().height() - 20);
  }
});
