'use strict';

const spawn = require('child_process').spawn;
const Duplexify = require('duplexify');
const isError = require('util').types.isNativeError;

class Unoconv extends Duplexify {
  constructor(binloc) {
    super();
    this.spawned = false;
    this.settings = [];
    this.set('--stdin');
    this.set('--stdout');
    this.binary = binloc || 'unoconv';
  }

  resume() {
    if (!this.spawned) this.spawn();
    this.spawned = true;
    super.resume();
  }

  outputFormat(format) {
    this.format = format;
    return this;
  }

  set(setting) {
    setting.split(' ').forEach((word) => {
      this.settings.push(word);
    });

    return this;
  }

  spawn() {
    const onerror = this.onerror.bind(this);
    var errors = []; // stderr, only emitted if return code is > 0
    const proc = spawn(this.binary, this.args());

    const stdout = proc.stdout;
    stdout.on('error', onerror);
    this.setReadable(stdout);

    const stdin = proc.stdin;
    stdin.on('error', onerror);
    this.setWritable(stdin);

    const stderr = proc.stderr;
    stderr.on('data', function (chunk) {
      errors.push(chunk);
    });
    stderr.on('error', onerror);

    proc.on('exit', function (code) {
      if (code > 0) {
        errors.push('Unoconv exited with code ' + code);
        onerror(errors.join('\n'));
      }
    });
  }

  args() {
    return this.settings.concat(['-f', this.format]);
  }

  onerror(err) {
    if (!isError(err)) err = new Error(err);
    if (!this.listeners('error')) throw err;
    this.emit('error', err);
  }
}

module.exports = (binloc) => new Unoconv(binloc);
