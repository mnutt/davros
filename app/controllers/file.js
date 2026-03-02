import Controller from '@ember/controller';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import File from '../models/file';

export default class FileController extends Controller {
  @service router;

  uploadFile = task({ maxConcurrency: 5, enqueue: true }, async (file) => {
    if (!file.name && file.size === 0) {
      return;
    } // directory placeholder from drag/drop

    let location = document.location.pathname;
    const nativeFile = file.file || {};
    let path = nativeFile.webkitRelativePath || file.fullPath || file.name;
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

    await File.ensureCollectionExists(fullPath);
    await file.upload('/api/upload', {
      data: {
        destination: fullPath,
      },
    });
    await this.model.reload();
  });

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
