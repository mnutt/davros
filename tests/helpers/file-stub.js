import Pretender from 'pretender';

let root =
  '<?xml version="1.0" encoding="utf-8"?><d:multistatus xmlns:d="DAV:" xmlns:a="http://ajax.org/2005/aml"><d:response><d:href>/remote.php/webdav/</d:href><d:propstat><d:prop><d:getlastmodified xmlns:b="urn:uuid:c2f41010-65b3-11d1-a29f-00aa00c14882/" b:dt="dateTime.rfc1123">Wed, 06 Jan 2016 06:35:13 +0000</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>389120</d:quota-used-bytes><d:quota-available-bytes>425099649024</d:quota-available-bytes></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/myDir/</d:href><d:propstat><d:prop><d:getlastmodified xmlns:b="urn:uuid:c2f41010-65b3-11d1-a29f-00aa00c14882/" b:dt="dateTime.rfc1123">Wed, 06 Jan 2016 06:35:13 +0000</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>4096</d:quota-used-bytes><d:quota-available-bytes>425099649024</d:quota-available-bytes></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/space.jpg</d:href><d:propstat><d:prop><d:getlastmodified xmlns:b="urn:uuid:c2f41010-65b3-11d1-a29f-00aa00c14882/" b:dt="dateTime.rfc1123">Wed, 06 Jan 2016 06:33:58 +0000</d:getlastmodified><d:getcontentlength>378200</d:getcontentlength><d:resourcetype></d:resourcetype><d:getetag>&#34;f1eef05bd6c8c652476d9d22a94d520c&#34;</d:getetag><d:getcontenttype>image/jpeg</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response></d:multistatus>';

let myDir =
  '<?xml version="1.0" encoding="utf-8"?><d:multistatus xmlns:d="DAV:" xmlns:a="http://ajax.org/2005/aml"><d:response><d:href>/remote.php/webdav/myDir/</d:href><d:propstat><d:prop><d:getlastmodified xmlns:b="urn:uuid:c2f41010-65b3-11d1-a29f-00aa00c14882/" b:dt="dateTime.rfc1123">Wed, 06 Jan 2016 06:40:54 +0000</d:getlastmodified><d:resourcetype><d:collection/></d:resourcetype><d:quota-used-bytes>225280</d:quota-used-bytes><d:quota-available-bytes>425098493952</d:quota-available-bytes></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response><d:response><d:href>/remote.php/webdav/myDir/ios-davros.png</d:href><d:propstat><d:prop><d:getlastmodified xmlns:b="urn:uuid:c2f41010-65b3-11d1-a29f-00aa00c14882/" b:dt="dateTime.rfc1123">Wed, 06 Jan 2016 06:40:54 +0000</d:getlastmodified><d:getcontentlength>218233</d:getcontentlength><d:resourcetype></d:resourcetype><d:getetag>&#34;4ec0d937b45f263893d0cfaca5ec90e5&#34;</d:getetag><d:getcontenttype>image/png</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response></d:multistatus>';

let space =
  '<?xml version="1.0" encoding="utf-8"?><d:multistatus xmlns:d="DAV:" xmlns:a="http://ajax.org/2005/aml"><d:response><d:href>/remote.php/webdav/space.jpg</d:href><d:propstat><d:prop><d:getlastmodified xmlns:b="urn:uuid:c2f41010-65b3-11d1-a29f-00aa00c14882/" b:dt="dateTime.rfc1123">Wed, 06 Jan 2016 06:33:58 +0000</d:getlastmodified><d:getcontentlength>378200</d:getcontentlength><d:resourcetype></d:resourcetype><d:getetag>&#34;f1eef05bd6c8c652476d9d22a94d520c&#34;</d:getetag><d:getcontenttype>image/jpeg</d:getcontenttype></d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response></d:multistatus>';

export default function() {
  return new Pretender(function() {
    // HACK to make propfinds work, since we don't currently use PATCH it's probably ok
    let registry = this.hosts.forURL('/remote.php/webdav/');
    registry['PROPFIND'] = registry['PATCH'];

    this.register('PROPFIND', '/remote.php/webdav/', function() {
      return [200, {}, root];
    });

    this.register('PROPFIND', '/remote.php/webdav/myDir/', function() {
      return [200, {}, myDir];
    });

    this.register('PROPFIND', '/remote.php/webdav/space.jpg', function() {
      return [200, {}, space];
    });
  });
}
