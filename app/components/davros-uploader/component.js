import fileDropzone from 'ember-file-upload/components/file-dropzone/component';
import DragListener from 'ember-file-upload/system/drag-listener';
import Ember from 'ember';

const { get } = Ember;
const { bind } = Ember.run;

const dragListener = new DragListener();

export default fileDropzone.extend({
  didInsertElement() {
    this._super();

    if (get(this, 'fullscreen')) {
      dragListener.addEventListeners('body', {
        dragenter: bind(this, 'didEnterDropzone'),
        dragleave: bind(this, 'didLeaveDropzone'),
        dragover:  bind(this, 'didDragOver'),
        drop:      bind(this, 'didDrop')
      });
    }
  },

  willDestroyElement() {
    this._super();

    if (get(this, 'fullscreen')) {
      dragListener.removeEventListeners('body');
    }
  }
});
