import plUploader from 'ember-plupload/components/pl-uploader';
import jQuery from 'jquery';
import Ember from 'ember';

const { get, set } = Ember;

export default plUploader.extend({
  BASE_URL: '/assets/',

  fixConfig: Ember.on('didInsertElement', function() {
    delete this.get('config').required_features.send_browser_cookies;
  }),

  dropzoneElement() {
    return jQuery(`#${get(this, 'dropzone.id')}`);
  },

  attachUploader() {
    var uploader = get(this, 'uploader');
    var queue = uploader.findOrCreate(get(this, 'name'), this, get(this, 'config'));
    set(this, 'queue', queue);

    // Send up the pluploader object so the app implementing this component as has access to it
    var pluploader = queue.get('queues.firstObject');
    this.sendAction('onInitOfUploader', pluploader);
    this._dragCounter = 0;
    this._invalidateDragData();
  },

  enteredDropzone(evt) {
    var e = evt.originalEvent;
    if (e.preventDefault) { e.preventDefault(); }
    if (e.stopPropagation) { e.stopPropagation(); }
    if (this._dragCounter === 0) {
      this.activateDropzone(evt.originalEvent);
    }
    this._dragCounter++;
  },

  leftDropzone(evt) {
    var e = evt.originalEvent;
    if (e.preventDefault) { e.preventDefault(); }
    if (e.stopPropagation) { e.stopPropagation(); }
    this._dragCounter--;
    if (this._dragCounter === 0) {
      this.deactivateDropzone();
    }
  },

  activateDropzone(evt) {
    this.dropzoneElement().addClass('dropzone-active');
    set(this, 'dragData', get(evt, 'dataTransfer'));
  },

  deactivateDropzone() {
    this._dragCounter = 0;
    this.dropzoneElement().removeClass('dropzone-active');
    set(this, 'dragData', null);
  },

  detachUploader: Ember.on('willDestroyElement', function () {
    var queue = get(this, 'queue');
    if (queue) {
      queue.orphan();
    }
  })
});
