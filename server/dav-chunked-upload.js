var fs      = require('fs');
var path    = require('path');
var async   = require("async");
var concat  = require('concat-files');
var dirStat = require('dirStat').dirStat;

var jsDAV_ServerPlugin = require("jsdav/lib/DAV/plugin");
var Util               = require("jsdav/lib/shared/util");

var jsDAV_Chunked_Upload_Plugin = module.exports = jsDAV_ServerPlugin.extend({
  name: "chunked-upload",

  initialize: function(handler) {
    this.handler = handler;
    this.tempDir = handler.server.options.tempDir;

    handler.addEventListener("beforeCreateFile", this.beforeCreateFile.bind(this), 0x0004, false);
  },

  chunkMatch: /(.*?)-chunking-(\d+)-(\d+)-(\d+)(-done)?$/,

  // We have to monkey patch a bunch of the createFile nonsense to get the server
  // to not write an etag
  beforeCreateFile: function(e, uri, dataOrStream, enc, parent) {
    var self = this;
    if(!this.isChunked()) {
      return e.next();
    }

    var filename  = path.basename(uri);
    var tempPath = path.join(this.tempDir, filename);

    self.handler.getRequestBody(enc, null, false, function(err, body, cleanup) {
      if (err) { return e.next(err); }

      fs.writeFile(tempPath, body, enc, function(err) {
        if (cleanup)
          cleanup();
        if (err)
          return e.next(err);

        self.atomicMove(tempPath, function(err) {
          if(err) { return self.handler.handleError(err); }

          self.checkForFinished(uri, function(finished, parts, originalName) {
            if(finished) {
              self.finish(uri, parts);
            } else {
              e.stop();
            }
          });
        });
      });
    });
  },

  atomicMove: function(realPath, cb) {
    fs.rename(realPath, realPath + "-done", function(err) {
      cb(err);
    });
  },

  finish: function(uri, parts) {
    var self = this;
    var dir = path.dirname(uri);
    var realDir = this.handler.server.tree.getRealPath(dir);
    var originalName = path.basename(this.originalUri(uri));

    this.concatenateParts(parts, originalName, realDir, function(err) {
      if(err) { return self.handler.handleError(err); }

      self.hashForUri(uri, function(err, etag) {
        if(err) { return self.handler.handleError(err); }

        var headers = {"content-length": "0", "etag": etag};
        self.handler.httpResponse.writeHead(201, headers);
        self.handler.httpResponse.end();
        self.handler.dispatchEvent("afterWriteContent", uri);
      });
    });
  },

  hashForUri: function(uri, cb) {
    var realPath = this.handler.server.tree.getRealPath(this.originalUri(uri));
    Util.log("Hashing " + realPath);
    var stream = fs.createReadStream(realPath);
    Util.createHashStream(stream, function(err, hash) {
      if(err) {
        return cb(err);
      }

      cb(null, '"' + hash + '"');
    });
  },

  originalUri: function(uri) {
    return uri.replace(this.chunkMatch, '$1');
  },

  isChunked: function() {
    return this.handler.httpRequest.headers['oc-chunked'];
  },

  checkForFinished: function(uri, cb) {
    var self = this;
    var filename = path.basename(uri);
    var dirname = path.dirname(uri);
    var realDir = this.handler.server.tree.getRealPath(dirname);

    var parts = filename.match(this.chunkMatch);

    if(parts) {
      var originalName = parts[1];
      var uid = parts[2];
      var totalChunks = parseInt(parts[3]);
      var myChunk = parseInt(parts[4]);

      fs.readdir(this.tempDir, function(err, files) {
        if(err) {
          console.error("readdir error: " + err);
          return cb(false);
        }

        var finishedChunks = [];
        files.forEach(function(file) {
          var match = file.match(self.chunkMatch);
          if(match && match[2] === uid && match[5] === '-done') {
            var chunkPath = path.join(self.tempDir, file);
            finishedChunks.push(chunkPath);
          }
        });

        Util.log(finishedChunks.length + " / " + totalChunks + " finished.");

        if(finishedChunks.length == totalChunks) {
          cb(true, finishedChunks);
        } else {
          cb(false);
        }
      });
    } else {
      cb(false);
    }
  },

  concatenateParts: function(chunks, outfile, dir, cb) {
    concat(chunks,
           path.join(dir, outfile),
           function() {
             async.forEach(chunks, function(chunkPath, next) {
               fs.unlink(chunkPath, function(err) {
                 if(err) { console.error("Unlinking error: " + err); }
                 Util.log("Removed " + chunkPath);
                 next();
               });
             }, function(err) {
               if(err) { console.error("Concat error: " + err); }
               cb(err, outfile);
             });
           });
  }
});
