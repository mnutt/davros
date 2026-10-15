const fs = require('node:fs/promises');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');
const express = require('express');
const compression = require('compression');
const request = require('supertest');
const previewDocument = require('../api/preview-document');
const { createPreviewService } = require('../document-preview');
const permissions = require('../sandstorm_permissions');
const { officeFixture } = require('./support/office-fixtures');

describe('server document preview', () => {
  let directory, root, cacheDir, app;
  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'davros-preview-test-'));
    root = path.join(directory, 'files');
    cacheDir = path.join(directory, 'cache');
    await fs.mkdir(root);
    app = express();
    app.use(permissions);
    app.get('/api/preview-document', previewDocument(root, createPreviewService({ cacheDir })));
  });
  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  function preview(name) {
    return request(app)
      .get('/api/preview-document')
      .query({ path: `/dav/${encodeURIComponent(name)}` })
      .set('x-sandstorm-permissions', 'view');
  }

  for (const kind of ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp']) {
    it(`routes ${kind} files to the converter with a normalized extension`, async () => {
      const pdf = path.join(directory, 'preview.pdf');
      await fs.writeFile(pdf, '%PDF-1.7\n');
      const get = vi.fn(async (source) => {
        await source.close();
        return fs.open(pdf, 'r');
      });
      const routingApp = express();
      routingApp.get('/api/preview-document', previewDocument(root, { get }));
      for (const extension of [kind, kind.toUpperCase()]) {
        const name = `document.${extension}`;
        await fs.writeFile(path.join(root, name), 'converter input');
        const response = await request(routingApp)
          .get('/api/preview-document')
          .query({ path: `/dav/${name}` })
          .expect(200);
        expect(response.headers['content-type']).toBe('application/pdf');
        expect(response.body.toString()).toBe('%PDF-1.7\n');
        expect(get.mock.lastCall[2]).toBe(kind);
      }
    });
  }

  for (const kind of ['docx', 'pptx', 'xlsx']) {
    it(`converts ${kind}, caches it, and serves PDF byte ranges`, async () => {
      const name = `Pass & Seymour # ü + 100%.${kind}`;
      await fs.writeFile(path.join(root, name), await officeFixture(kind));
      const prepared = await preview(name).query({ prepare: '1' }).expect(200);
      expect(prepared.body).toEqual({ ready: true });
      const response = await preview(name).expect(200);
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.body.subarray(0, 5).toString()).toBe('%PDF-');
      const extracted = spawnSync('pdftotext', ['-', '-'], { input: response.body });
      expect(extracted.error).toBeUndefined();
      expect(extracted.status).toBe(0);
      // Rotated slide text may be split into separate PDF text runs.
      expect(extracted.stdout.toString().replace(/\s/g, '')).toContain('Selectablepreviewtext');
      if (kind === 'xlsx') {
        expect(extracted.stdout.toString()).toContain('12.5%');
        expect(extracted.stdout.toString()).not.toContain('13.0%');
        expect(extracted.stdout.toString()).toContain('$12.50');
        expect(extracted.stdout.toString()).not.toContain('$12.500');
      }
      const files = (await fs.readdir(cacheDir)).filter((name) => name.endsWith('.pdf'));
      expect(files).toHaveLength(1);
      const stat = await fs.stat(path.join(cacheDir, files[0]));
      const range = await preview(name).set('Range', 'bytes=0-4').expect(206);
      expect(range.body.toString()).toBe('%PDF-');
      expect(range.headers['content-range']).toBe(`bytes 0-4/${response.body.length}`);
      const suffix = await preview(name).set('Range', 'bytes=-5').expect(206);
      expect(suffix.body).toEqual(response.body.subarray(-5));
      await preview(name).set('Range', 'bytes=999999999-').expect(416);
      const repeat = await preview(name).expect(200);
      expect(repeat.body).toEqual(response.body);
      expect((await fs.stat(path.join(cacheDir, files[0]))).mtimeMs).toBe(stat.mtimeMs);
      await fs.writeFile(path.join(root, name), await officeFixture(kind, 'Changed content'));
      await preview(name).query({ prepare: '1' }).expect(200);
      expect((await fs.readdir(cacheDir)).filter((name) => name.endsWith('.pdf'))).toHaveLength(2);
    }, 30000);
  }

  for (const spreadsheetPrefix of ['x', 'spreadsheet']) {
    it(`reads ${spreadsheetPrefix}-prefixed SpreadsheetML, styles and shared strings`, async () => {
      const name = `prefixed-${spreadsheetPrefix}.xlsx`;
      await fs.writeFile(path.join(root, name), await officeFixture('xlsx', 'Namespace content', { spreadsheetPrefix }));
      const response = await preview(name).expect(200);
      const extracted = spawnSync('pdftotext', ['-', '-'], { input: response.body });
      expect(extracted.status).toBe(0);
      const text = extracted.stdout.toString();
      expect(text.replace(/\s/g, '')).toContain('Namespacecontent');
      expect(text.replace(/\s/g, '')).toContain('Sharednamespacevalue');
      expect(text).toContain('12.5%');
      expect(text).toContain('$12.50');
      expect(text).not.toContain('Foreign');
      const baseline = `unprefixed-${spreadsheetPrefix}.xlsx`;
      await fs.writeFile(path.join(root, baseline), await officeFixture('xlsx', 'Namespace content'));
      const plain = await preview(baseline).expect(200);
      const plainText = spawnSync('pdftotext', ['-', '-'], { input: plain.body });
      expect(plainText.status).toBe(0);
      // Includes page breaks: an unrelated namespace must not add an empty sheet.
      expect(text).toBe(plainText.stdout.toString());
    }, 30000);
  }

  it('widens spreadsheet pages while keeping all columns and vertical pagination', async () => {
    const name = 'wide.xlsx';
    await fs.writeFile(path.join(root, name), await officeFixture('xlsx', 'Left column', { wideSheet: true }));
    const response = await preview(name).expect(200);
    const extracted = spawnSync('pdftotext', ['-', '-'], { input: response.body });
    expect(extracted.status).toBe(0);
    const pages = extracted.stdout.toString().split('\f');
    const first = pages[0].replace(/\s/g, '');
    expect(first).toContain('Leftcolumn1');
    expect(first).toContain('12.5%');
    expect(first).toContain('$12.50');
    expect(first).toContain('Sharednamespacevalue');
    expect(first).not.toContain('Leftcolumn205');
    expect(pages.slice(1).join('').replace(/\s/g, '')).toContain('Leftcolumn205');
    const info = spawnSync('pdfinfo', ['-'], { input: response.body });
    expect(info.status).toBe(0);
    const dimensions = /Page size:\s+([\d.]+) x ([\d.]+) pts/.exec(info.stdout.toString());
    expect(dimensions).not.toBeNull();
    expect(Number(dimensions[1])).toBeGreaterThan(1500);
    expect(Number(dimensions[2])).toBeLessThan(900);
  }, 30000);

  it('rejects traversal, symlink escapes, unsupported files, and missing files', async () => {
    await fs.writeFile(path.join(directory, 'outside.docx'), 'private');
    await fs.symlink(path.join(directory, 'outside.docx'), path.join(root, 'escape.docx'));
    await fs.writeFile(path.join(root, 'plain.txt'), 'text');
    await preview('escape.docx').expect(403);
    await preview('../outside.docx').expect(400);
    await preview('plain.txt').expect(415);
    await preview('missing.docx').expect(404);
    await request(app)
      .get('/api/preview-document')
      .query({ path: 'https://example.com/file.docx' })
      .expect(400);
    await request(app)
      .get('/api/preview-document')
      .query({ path: '/dav/file.docx' })
      .set('x-sandstorm-permissions', 'unknown')
      .expect(403);
  });

  it('reports malformed documents without caching partial output', async () => {
    await fs.writeFile(path.join(root, 'bad.docx'), 'not a zip');
    await preview('bad.docx').expect(422);
    expect(await fs.readdir(cacheDir)).toEqual([]);
  });

  it('leaves errors readable when Sandstorm discards content encoding and relabels JSON as HTML', async () => {
    await fs.writeFile(path.join(root, 'error.docx'), 'document');
    const error = Object.assign(
      new Error('Renderer failed: <details>' + 'diagnostic '.repeat(200)),
      { status: 422 },
    );
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const compressedApp = express();
    compressedApp.use(compression({ threshold: 0 }));
    compressedApp.get(
      '/api/preview-document',
      previewDocument(root, {
        async get(source) {
          await source.close();
          throw error;
        },
      }),
    );
    try {
      const response = await request(compressedApp)
        .get('/api/preview-document')
        .query({ path: '/dav/error.docx' })
        .set('Accept-Encoding', 'gzip, deflate')
        .expect(422);
      expect(response.headers['content-encoding']).toBeUndefined();
      expect(response.headers['cache-control']).toContain('no-transform');
      expect(response.text).not.toContain('<details>');
      expect(JSON.parse(response.text).error).toBe(error.message);
      expect(log).toHaveBeenCalledWith('Document preview failed:', error);
    } finally {
      log.mockRestore();
    }
  });
});
