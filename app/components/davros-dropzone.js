import { bind } from '@ember/runloop';
import FileDropzone from 'ember-file-upload/components/file-dropzone/component';
import DragListener from 'ember-file-upload/system/drag-listener';
import { action } from '@ember/object';

const dragListener = new DragListener();

export default class DavrosUploader extends FileDropzone {
  @action
  addBodyEventListeners() {
    dragListener.addEventListeners('body', {
      dragenter: bind(this, 'didEnterDropzone'),
      dragleave: bind(this, 'didLeaveDropzone'),
      dragover: bind(this, 'didDragOver'),
      drop: bind(this, 'didDrop'),
    });
  }

  @action
  removeBodyEventListeners() {
    dragListener.removeEventListeners('body');
  }
}
