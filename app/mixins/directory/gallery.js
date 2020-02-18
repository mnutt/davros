import Mixin from '@ember/object/mixin';

export default Mixin.create({
  galleryEnabled: false,

  directoryGalleryItems: function() {
    return this.get('model.sortedFiles').filter((file) => {
      return file.get('type') === "image";
    }).map((file) => {
      return {src: file.get('rawPath'), title: file.get('name')};
    });
  }.property('model.sortedFiles'),
  galleryOptions: { hideShare: true },

  actions: {
    slideshow: function() {
      this.set('galleryEnabled', true);
    }
  }
});
