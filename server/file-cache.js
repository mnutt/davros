var stream = require('stream');
var util = require('util');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');
var mkdirp = require('mkdirp');
var Transform = stream.Transform;

class FileCache extends Transform {
  constructor(cacheDir, url, time) {
    super();

    time = time > 0 ? time : "t";
    this.cacheDir = cacheDir;
    this.key = crypto.createHash('md5').update(url).digest('hex');
    this.fileName = [this.key, time].join('_');
    this.path = this.cachePathFor(this.fileName);
  }

  _transform(chunk, encoding, done) {
    if (this.cachedFile) {
      this.__transform(chunk, encoding, done);
    } else {
      mkdirp(path.dirname(this.path)).then(() => {
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
      files.filter((name) => {
        if (this.fileName === name) {
          return false;
        } else {
          return name.indexOf(this.key) === 0;
        }
      }).forEach((name) => {
        console.log("Cleaned up " + (this.cachePathFor(name)));
        fs.unlink(this.cachePathFor(name), () => {});
      });
    });
  }

  cachePathFor(name) {
    var parts = [this.key.slice(0, 3), this.key.slice(3, 6), this.key.slice(6, 9)];
    return [this.cacheDir].concat(parts).concat(name).join('/');
  }

  get(cb) {
    fs.exists(this.path, (exists) => {
      if (exists) {
        return cb(fs.createReadStream(this.path), this.path);
      } else {
        return cb(false, this.path);
      }
    });
  }
};

module.exports = FileCache;
