import plUploader from 'ember-plupload/components/pl-uploader';
import jQuery from 'jquery';
import Ember from 'ember';

export default plUploader.extend({
  activateDropzone(evt) {
    jQuery(`#${Ember.get(this, 'dropzone.id')}`).addClass('dropzone-active');
    Ember.set(this, 'dragData', Ember.get(evt, 'dataTransfer'));
  },

  deactivateDropzone() {
    jQuery(`#${Ember.get(this, 'dropzone.id')}`).removeClass('dropzone-active');
    Ember.set(this, 'dragData', null);
  }
});
