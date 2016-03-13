import typeDocument from './type-document';

export default typeDocument.extend({
  viewingSource: false,

  actions: {
    toggleSource: function() {
      this.toggleProperty('viewingSource');
    }
  }
});
