/* eslint-env node, mocha */

const assert = require('chai').assert;
const request = require('supertest');
const support = require('./support');

describe('GET directory', function () {
  let server = support.makeApp();

  describe('empty directory', function () {
    it('returns an empty directory listing', function (done) {
      request(server)
        .propfind('/dav')
        .set('content-type', 'application/xml')
        .expect(function (res) {
          let listing = support.directoryListing(res);
          assert.equal(listing.length, 1);
          assert.equal(listing[0].href, '/dav/');
        })
        .expect(207, done);
    });
  });

  describe('with a file', function () {
    it('returns directory listing', function (done) {
      request(server)
        .put('/dav/foo.txt')
        .send({ foo: 'foobar' })
        .expect(200, function () {
          request(server)
            .propfind('/dav')
            .set('content-type', 'application/xml')
            .expect(function (res) {
              let listing = support.directoryListing(res);
              assert.equal(listing.length, 2);
              assert.equal(listing[1].href, '/dav/foo.txt');
            })
            .expect(207, done);
        });
    });
  });
});

describe('GET for owncloud/nextcloud', function () {
  let server = support.makeApp();

  describe('rewriting for legacy owncloud', function () {
    it('returns an empty directory listing', function (done) {
      request(server)
        .propfind('/remote.php/webdav')
        .set('content-type', 'application/xml')
        .expect(function (res) {
          assert.equal(res.statusCode, 207);
          let listing = support.directoryListing(res);
          assert.equal(listing.length, 1);
          assert.equal(listing[0].href, '/remote.php/webdav/');
        })
        .expect(207, done);
    });
  });

  describe('rewriting for new owncloud/nextcloud', function () {
    it('returns an empty directory listing', function (done) {
      request(server)
        .propfind('/remote.php/dav/files/foo')
        .set('content-type', 'application/xml')
        .expect(function (res) {
          assert.equal(res.statusCode, 207);
          let listing = support.directoryListing(res);
          assert.equal(listing.length, 1);
          assert.equal(listing[0].href, '/remote.php/dav/files/foo/');
        })
        .expect(207, done);
    });
  });
});

describe('PUT file', function () {
  let server = support.makeApp();

  it('accepts x-oc-mtime header for owncloud', function (done) {
    request(server)
      .put('/dav/foo.txt')
      .send({ foo: 'foobar' })
      .set('x-oc-mtime', '1469294928893')
      .end(function (_, res) {
        assert.equal(res.header['x-oc-mtime'], 'accepted');
        done();
      });
  });

  it('changes the directory etag', function (done) {
    request(server)
      .put('/dav/foo.txt')
      .send({ foo: 'foobar' })
      .end(function () {
        request(server)
          .propfind('/dav')
          .end(function (_, res) {
            let listing = support.directoryListing(res);
            let etag = listing[0].etag;
            assert.ok(etag, 'initial directory listing should have etag set');

            setTimeout(function () {
              request(server)
                .put('/dav/bar.txt')
                .send({ foo: 'foobar' })
                .expect(200, function () {
                  request(server)
                    .propfind('/dav')
                    .set('content-type', 'application/xml')
                    .expect(function (res) {
                      let listing = support.directoryListing(res);
                      let newEtag = listing[0].etag;
                      assert.ok(newEtag, 'new directory listing should have etag set');
                      assert.ok(
                        etag !== newEtag,
                        'etag should be different than before: ' + etag + ', ' + newEtag
                      );
                    })
                    .expect(207, done);
                });
            }, 1000);
          });
      });
  });
});
