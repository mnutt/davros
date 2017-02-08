/* eslint-env node, mocha */

const os      = require('os');
const http    = require('http');
const fs      = require('fs');
const express = require('express');
const xmldoc  = require('xmldoc');
const api     = require('../../../server/index');

exports.makeApp = function() {
  process.env.STORAGE_PATH = os.tmpdir() + '/davros-test-data-' + Math.random();
  fs.mkdirSync(process.env.STORAGE_PATH);

  let app = express();
  let server = http.createServer(app);
  api(app, {httpServer: server});
  return app;
};

exports.xmlResponse = function(res) {
  return new xmldoc.XmlDocument(res.text);
};

exports.directoryListing = function(doc) {
  if(doc.text) {
    doc = exports.xmlResponse(doc);
  }

  return doc.children.map(function(el) {
    var prop = el.descendantWithPath('d:propstat.d:prop');
    return {
      href:          el.valueWithPath('d:href'),
      lastmodified:  prop.valueWithPath('d:getlastmodified'),
      contentLength: prop.valueWithPath('d:getcontentlength'),
      contentType:   prop.valueWithPath('d:getcontenttype'),
      etag:          prop.valueWithPath('d:getetag'),
      isCollection:  !!prop.descendantWithPath('d:resourcetype.d:collection')
    };
  });
};
