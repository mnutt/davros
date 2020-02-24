/* eslint-disable no-console */
const stream = require('stream');
const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const os = require('os');

const { Transform } = stream;

class FileCache extends Transform {
  constructor(url, time, cacheDir = os.tmpdir()) {
    super();

    time = time > 0 ? time : 't';

    this.cacheDir = cacheDir;
    this.key = crypto
      .createHash('md5')
      .update(url)
      .digest('hex');
    this.fileName = [this.key, time].join('_');
    this.path = this.cachePathFor(this.fileName);
  }

  _transform(chunk, encoding, done) {
    if (this.cachedFile) {
      this.__transform(chunk, encoding, done);
    }
    if (!this.cachedFile) {
      fs.mkdirp(path.dirname(this.path), () => {
        this.cachedFile = fs.createWriteStream(this.path);
        this.cleanOld();
        this.__transform(chunk, encoding, done);
      });
    }
  }

  _flush(done) {
    if (this.cachedFile) {
      this.cachedFile.end();
    }
    done();
  }

  __transform(chunk, encoding, done) {
    this.cachedFile.write(chunk, encoding);
    this.push(chunk);
    done();
  }

  cleanOld() {
    fs.readdir(path.dirname(this.path), (error, files) => {
      files
        .filter(name => {
          if (this.fileName === name) {
            return false;
          }
          return name.indexOf(this.key) === 0;
        })
        .forEach(name => {
          console.log(`Cleaned up ${this.cachePathFor(name)}`);

          fs.unlink(this.cachePathFor(name), err => {
            if (err) {
              console.error(`Cleanup: file ${this.cachePathFor(name)} already removed.`);
            }
          });
        });
    });
  }

  cachePathFor(name) {
    const parts = ['file-cache', this.key.slice(0, 3), this.key.slice(3, 6), this.key.slice(6, 9)];
    return [this.cacheDir]
      .concat(parts)
      .concat(name)
      .join('/');
  }

  async get() {
    try {
      const exists = await fs.exists(this.path);
      return exists && fs.createReadStream(this.path);
    } catch (e) {
      return null;
    }
  }
}

module.exports = FileCache;
