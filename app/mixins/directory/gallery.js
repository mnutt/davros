import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  galleryEnabled: false,

  directoryGalleryItems: computed('model.sortedFiles', function() {
    return this.get('model.sortedFiles').filter((file) => {
      return file.get('type') === "image";
    }).map((file) => {
      return {src: file.rawPath, title: file.name, w: file.width, h: file.height};
    });
  }),
  galleryOptions: { hideShare: true },

  actions: {
    slideshow: function() {
      this.set('galleryEnabled', true);
    }
  }
});
