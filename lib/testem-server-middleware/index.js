'use strict';

const path = require('path');
const os = require('os');
const { mkdtempSync } = require('fs');

module.exports = {
  name: require('./package').name,

  async testemMiddleware(app) {
    const { root } = this.project;

    // Must be sync in order to initialize app immediately
    process.env.STORAGE_PATH = mkdtempSync(path.join(os.tmpdir(), 'testdata-'));

    const server = require(path.join(root, 'server'));
    server(app, {});
  },

  isDevelopingAddon() {
    return true;
  },
};
