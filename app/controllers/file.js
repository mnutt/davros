import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import fetch from 'fetch';
import File from 'davros/models/file';

export default class FileController extends Controller {
  @service router;

  @task({
    maxConcurrency: 5,
    enqueue: true,
  })
  *uploadFile(file) {
    if (file.blob.type === '') {
      yield;
    } // it's a directory

    let location = document.location.pathname;
    let path = file.blob.webkitRelativePath || file.fullPath || file.name;
    path = encodeURIComponent(path);

    if (location.indexOf('/files') === 0) {
      // if user is in a directory, upload the files there
      location = location.replace(/^\/files\//, '');
      // dirname of current path, so if path is /foo/README, use /foo/
      location = location.replace(/\/[^/]*$/, '');
    } else {
      // otherwise, upload files in the root directory
      // (this shouldn't happen anymore)
      location = '';
    }

    if (path[0] !== '/') {
      path = '/' + path;
    }

    var fullPath = [location, path].join('');

    yield File.ensureCollectionExists(fullPath).then(() => {
      return file
        .upload('/api/upload', {
          data: {
            destination: fullPath,
          },
        })
        .then(() => {
          return this.model.reload();
        });
    });
  }

  @action
  newDirectory(dirname) {
    const { model } = this;

    const fullPath = [model.rawPath, encodeURIComponent(dirname)].join('/');

    return fetch(fullPath, { method: 'MKCOL' }).then(() => {
      return File.load(model.path);
    });
  }

  @action
  upload(file) {
    this.uploadFile.perform(file);
  }
}
