import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import File from 'davros/models/file';

export default class DavrosUploader extends Component {
  @service router;

  get uploadLocation() {
    let location = new URL(this.router.currentURL, 'http://localhost').pathname;

    if (location.startsWith('/files')) {
      location = location.replace(/^\/files/, '');

      if (!location.endsWith('/')) {
        // dirname of current path, so if path is /foo/README, use /foo/
        location = location.replace(/\/[^/]*$/, '');
      }

      location = location.replace(/^\//, '').replace(/\/$/, '');
    } else {
      // otherwise, upload files in the root directory
      // (this shouldn't happen anymore)
      location = '';
    }

    return location;
  }

  @task({
    maxConcurrency: 5,
    enqueue: true,
  })
  *uploadFile(file) {
    if (file.blob.type === '') {
      yield;
    } // it's a directory

    let path = file.blob.webkitRelativePath || file.fullPath || file.name;
    path = encodeURIComponent(path);

    if (path[0] !== '/') {
      path = '/' + path;
    }

    var fullPath = ['/', this.uploadLocation, path].join('');

    // THis SAVES IT!!!
    // yield File.ensureCollectionExists('/').then(() => {
    // yield File.ensureCollectionExists(fullPath).then(() => {
    // yield File.ensureCollectionExists(fullPath.replace("%20"," ")).then(() => {
    yield File.ensureCollectionExists(decodeURI(fullPath)).then(() => {
      return file.upload('/api/upload', {
        data: {
          destination: fullPath,
        },
      });
    });
  }

  @action upload(file) {
    this.uploadFile.perform(file);
  }
}
