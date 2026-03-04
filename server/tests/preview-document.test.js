/* eslint-env node */

const previewDocument = require('../api/preview-document');
const officePreview = require('../powerbox/office-preview');

function makeResponse() {
  return {
    statusCode: 200,
    body: undefined,
    contentType: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      this.contentType = 'application/json';
      return this;
    },
    send(payload) {
      this.body = payload;
      this.contentType = 'text/plain';
      return this;
    },
    type(contentType) {
      this.contentType = contentType;
      return this;
    },
  };
}

describe('preview document route', function () {
  const originalGetCapability = officePreview.getCapability;
  const originalConvertOfficeToPdf = officePreview.convertOfficeToPdf;
  const originalGetPowerboxQueryDescriptor = officePreview.getPowerboxQueryDescriptor;

  afterEach(function () {
    officePreview.getCapability = originalGetCapability;
    officePreview.convertOfficeToPdf = originalConvertOfficeToPdf;
    officePreview.getPowerboxQueryDescriptor = originalGetPowerboxQueryDescriptor;
  });

  it('returns powerboxRequired payload for missing capability conversion errors', async function () {
    officePreview.getCapability = async function () {
      return 'cap-that-looks-set';
    };
    officePreview.convertOfficeToPdf = async function () {
      throw new Error('Missing office preview capability');
    };
    officePreview.getPowerboxQueryDescriptor = function () {
      return 'query-descriptor';
    };

    const handler = previewDocument(function () {});
    const req = {
      url: '/api/preview?url=/dav/test.docx&ts=123',
      headers: {},
    };
    const res = makeResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      powerboxRequired: true,
      queryDescriptor: 'query-descriptor',
    });
  });

  it('returns powerboxRequired payload when conversion reports missing auth header', async function () {
    officePreview.getCapability = async function () {
      return 'cap-that-looks-set';
    };
    officePreview.convertOfficeToPdf = async function () {
      throw new Error('Office preview conversion failed (400): missing authorization header');
    };
    officePreview.getPowerboxQueryDescriptor = function () {
      return 'query-descriptor';
    };

    const handler = previewDocument(function () {});
    const req = {
      url: '/api/preview?url=/dav/test.docx&ts=123',
      headers: {},
    };
    const res = makeResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      powerboxRequired: true,
      queryDescriptor: 'query-descriptor',
    });
  });
});
