/* eslint-env node, mocha */

const assert  = require('chai').assert;
const request = require('supertest');
const support = require('./support');

describe('GET directory', function() {
  let server = support.makeApp();

  describe('empty directory', function() {
    it('returns an empty directory listing', function(done) {
      request(server)
        .propfind('/remote.php/webdav')
        .set('content-type', 'application/xml')
        .expect(function(res) {
          let listing = support.directoryListing(res);
          assert.equal(listing.length, 1);
          assert.equal(listing[0].href, '/remote.php/webdav/');
        })
        .expect(207, done);
    });
  });

  describe('with a file', function() {
    it('returns directory listing', function(done) {
      request(server)
        .put('/remote.php/webdav/foo.txt')
        .send({foo: 'foobar'})
        .expect(200, function() {
          request(server)
            .propfind('/remote.php/webdav')
            .set('content-type', 'application/xml')
            .expect(function(res) {
              let listing = support.directoryListing(res);
              assert.equal(listing.length, 2);
              assert.equal(listing[1].href, '/remote.php/webdav/foo.txt');
            })
            .expect(207, done);
        });
    });
  });
});

describe('PUT file', function() {
  let server = support.makeApp();

  it('accepts x-oc-mtime header for owncloud', function(done) {
    request(server)
      .put('/remote.php/webdav/foo.txt')
      .send({foo: 'foobar'})
      .set('x-oc-mtime', '1469294928893')
      .end(function(_, res) {
        assert.equal(res.header['x-oc-mtime'], 'accepted');
        done();
      });
  });

  it('changes the directory etag', function(done) {
    request(server)
      .put('/remote.php/webdav/foo.txt')
      .send({foo: 'foobar'})
      .end(function() {
        request(server)
          .propfind('/remote.php/webdav')
          .end(function(_, res) {
            let listing = support.directoryListing(res);
            let etag = listing[0].etag;
            assert.ok(etag, 'initial directory listing should have etag set');

            setTimeout(function() {
            request(server)
              .put('/remote.php/webdav/bar.txt')
              .send({foo: 'foobar'})
              .expect(200, function() {
                request(server)
                  .propfind('/remote.php/webdav')
                  .set('content-type', 'application/xml')
                  .expect(function(res) {
                    let listing = support.directoryListing(res);
                    let newEtag = listing[0].etag;
                    assert.ok(newEtag, 'new directory listing should have etag set');
                    assert.ok(etag !== newEtag, 'etag should be different than before: ' + etag + ', ' + newEtag);
                  })
                  .expect(207, done);
              });
            }, 1000);
          });
      });
  });
});
