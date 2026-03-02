/* eslint-env node */

const request = require('supertest');
const support = require('./support');

describe('GET directory', function () {
  let server;

  beforeAll(function () {
    server = support.makeApp();
  });

  afterAll(async function () {
    await support.closeServer(server);
  });

  describe('empty directory', function () {
    it('returns an empty directory listing', async function () {
      await request(server)
        .propfind('/dav')
        .set('content-type', 'application/xml')
        .expect(function (res) {
          let listing = support.directoryListing(res);
          expect(listing.length).toBe(1);
          expect(listing[0].href).toBe('/dav/');
        })
        .expect(207);
    });
  });

  describe('with a file', function () {
    it('returns directory listing', async function () {
      await request(server).put('/dav/foo.txt').send({ foo: 'foobar' }).expect(201);

      await request(server)
        .propfind('/dav')
        .set('content-type', 'application/xml')
        .expect(function (res) {
          let listing = support.directoryListing(res);
          expect(listing.length).toBe(2);
          expect(listing[1].href).toBe('/dav/foo.txt');
        })
        .expect(207);
    });
  });
});

describe('GET for owncloud/nextcloud', function () {
  let server;

  beforeAll(function () {
    server = support.makeApp();
  });

  afterAll(async function () {
    await support.closeServer(server);
  });

  describe('rewriting for legacy owncloud', function () {
    it('returns an empty directory listing', async function () {
      await request(server)
        .propfind('/remote.php/webdav')
        .set('content-type', 'application/xml')
        .expect(function (res) {
          expect(res.statusCode).toBe(207);
          let listing = support.directoryListing(res);
          expect(listing.length).toBe(1);
          expect(listing[0].href).toBe('/remote.php/webdav/');
        })
        .expect(207);
    });
  });

  describe('rewriting for new owncloud/nextcloud', function () {
    it('returns an empty directory listing', async function () {
      await request(server)
        .propfind('/remote.php/dav/files/foo')
        .set('content-type', 'application/xml')
        .expect(function (res) {
          expect(res.statusCode).toBe(207);
          let listing = support.directoryListing(res);
          expect(listing.length).toBe(1);
          expect(listing[0].href).toBe('/remote.php/dav/files/foo/');
        })
        .expect(207);
    });
  });
});

describe('PUT file', function () {
  let server;

  beforeAll(function () {
    server = support.makeApp();
  });

  afterAll(async function () {
    await support.closeServer(server);
  });

  it('accepts x-oc-mtime header for owncloud', async function () {
    const res = await request(server)
      .put('/dav/foo.txt')
      .send({ foo: 'foobar' })
      .set('x-oc-mtime', '1469294928893')
      .expect(201);

    expect(res.header['x-oc-mtime']).toBe('accepted');
  });

  it('changes the directory etag', async function () {
    await request(server).put('/dav/foo.txt').send({ foo: 'foobar' }).expect(200);

    const beforeRes = await request(server).propfind('/dav').expect(207);
    const beforeListing = support.directoryListing(beforeRes);
    const etag = beforeListing[0].etag;

    expect(etag, 'initial directory listing should have etag set').toBeTruthy();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await request(server).put('/dav/bar.txt').send({ foo: 'foobar' }).expect(201);

    const afterRes = await request(server)
      .propfind('/dav')
      .set('content-type', 'application/xml')
      .expect(207);
    const afterListing = support.directoryListing(afterRes);
    const newEtag = afterListing[0].etag;

    expect(newEtag, 'new directory listing should have etag set').toBeTruthy();
    expect(
      newEtag !== etag,
      `etag should be different than before: ${etag}, ${newEtag}`
    ).toBe(true);
  });
});
