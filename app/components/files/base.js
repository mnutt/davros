import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement: function() {
    console.log(this.$().height());
    this.$(".preview").height(this.$().height() - 20);
  }
});
