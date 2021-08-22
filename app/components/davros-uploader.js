import { bind } from '@ember/runloop';
import fileDropzone from 'ember-file-upload/components/file-dropzone/component';
import DragListener from 'ember-file-upload/system/drag-listener';

const dragListener = new DragListener();

export default fileDropzone.extend({
  addBodyEventListeners() {
    if (this.fullscreen) {
      dragListener.addEventListeners('body', {
        dragenter: bind(this, 'didEnterDropzone'),
        dragleave: bind(this, 'didLeaveDropzone'),
        dragover: bind(this, 'didDragOver'),
        drop: bind(this, 'didDrop'),
      });
    }
  },

  removeBodyEventListeners() {
    if (this.fullscreen) {
      dragListener.removeEventListeners('body');
    }
  },
});
