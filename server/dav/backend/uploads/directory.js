var Fs = require('fs');
var Fse = require('fs-extra');
var Async = require('asyncjs');
var Path = require('path');

var DavDirectory = require('../directory');
var File = require('../file');
var Exc = require('jsDAV/lib/shared/exceptions');

var Directory = (module.exports = DavDirectory.extend({
  /**
   * Returns a specific child node, referenced by its name
   *
   * @param {String} name
   * @throws Sabre_DAV_Exception_FileNotFound
   * @return Sabre_DAV_INode
   */
  getChild: function (name, cbfsgetchild) {
    var path = Path.join(this.path, name);

    Fs.stat(path, function (err, stat) {
      if (err || typeof stat == 'undefined') {
        return cbfsgetchild(
          new Exc.FileNotFound('File with name ' + path + ' could not be located')
        );
      }
      cbfsgetchild(null, stat.isDirectory() ? Directory.new(path) : File.new(path));
    });
  },

  /**
   * Returns an array with all the child nodes
   *
   * @return jsDAV_iNode[]
   */
  getChildren: function (cbfsgetchildren) {
    var nodes = [];

    Async.readdir(this.path)
      .stat()
      .filter(function (file) {
        return file.name !== File.PROPS_DIR && file.name !== '.gitkeep';
      })
      .each(function (file, cbnextdirch) {
        nodes.push(file.stat.isDirectory() ? Directory.new(file.path) : File.new(file.path));
        cbnextdirch();
      })
      .end(function () {
        cbfsgetchildren(null, nodes);
      });
  },

  /**
   * Creates a new file in the directory whilst writing to a stream instead of
   * from Buffer objects that reside in memory.
   *
   * @param {jsDAV_Handler} handler
   * @param {String} name Name of the file
   * @param {String} [enc]
   * @param {Function} cbfscreatefile
   * @return void
   */
  createFileStream: async function (handler, name, enc, cbfscreatefile) {
    var chunkPath = Path.join(this.path, name);
    var filePath = Path.join(this.path, '.file');

    const headers = handler.httpRequest.headers;
    const offset = parseInt(headers['oc-chunk-offset']);

    const stream = Fs.createWriteStream(filePath, {
      encoding: enc,
      flags: 'a+',
      start: offset,
    });

    stream.on('close', () => {
      // touch the chunk path so that the client knows it exists
      Fse.ensureFile(chunkPath)
        .then(() => cbfscreatefile(null, null))
        .catch((err) => cbfscreatefile(err));
    });

    handler.getRequestBody(enc, stream, false, () => {});
  },
}));
