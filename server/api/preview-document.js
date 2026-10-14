const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { pipeline } = require('node:stream/promises');
const { createPreviewService, previewError } = require('../document-preview');

module.exports = function previewDocument(root, service = createPreviewService()) {
  return async (req, res) => {
    const controller = new AbortController();
    const abort = () => controller.abort();
    res.once('close', abort);
    res.set('Cache-Control', 'no-store');
    let source;
    try {
      if (typeof req.query.path !== 'string' || !req.query.path.startsWith('/dav/')) {
        throw previewError('Invalid document path.', 400);
      }
      let relative;
      try {
        relative = decodeURIComponent(req.query.path.slice(5));
      } catch {
        throw previewError('Invalid document path.', 400);
      }
      if (relative.includes('\0') || relative.split('/').includes('..')) {
        throw previewError('Invalid document path.', 400);
      }
      const resolvedRoot = await fs.promises.realpath(root);
      const file = await fs.promises.realpath(path.join(resolvedRoot, relative));
      if (!file.startsWith(resolvedRoot + path.sep)) throw previewError('Access denied.', 403);
      const kind = path.extname(relative).slice(1).toLowerCase();
      if (!['docx', 'xlsx', 'pptx'].includes(kind))
        throw previewError('Unsupported document type.', 415);
      source = await fs.promises.open(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
      const stat = await source.stat();
      if (!stat.isFile()) throw previewError('Not a document.', 400);
      if (stat.size > 32 * 1024 * 1024)
        throw previewError('Document exceeds the 32 MiB preview limit.', 413);
      // Never trust a client timestamp to identify cached file contents.
      const key = createHash('sha256')
        .update(
          JSON.stringify([file, kind, stat.dev, stat.ino, stat.size, stat.mtimeMs, stat.ctimeMs]),
        )
        .digest('hex');
      const ownedSource = source;
      source = null;
      const cached = await service.get(ownedSource, key, kind, controller.signal);
      try {
        if (req.query.prepare === '1') {
          res.json({ ready: true });
          return;
        }
        const { size } = await cached.stat();
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="preview.pdf"',
          'X-Content-Type-Options': 'nosniff',
          'Accept-Ranges': 'bytes',
          'Content-Security-Policy': "default-src 'none'",
          'Cache-Control': 'private, no-store, no-transform',
          ETag: `"${key}"`,
        });
        let start = 0;
        let end = size - 1;
        const range = req.headers.range;
        if (range && (!req.headers['if-range'] || req.headers['if-range'] === `"${key}"`)) {
          const match = /^bytes=(\d*)-(\d*)$/.exec(range);
          if (!match || (!match[1] && !match[2])) {
            res.status(416).set('Content-Range', `bytes */${size}`).end();
            return;
          }
          start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
          end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
          if (
            !Number.isSafeInteger(start) ||
            !Number.isSafeInteger(end) ||
            start > end ||
            start >= size
          ) {
            res.status(416).set('Content-Range', `bytes */${size}`).end();
            return;
          }
          res.status(206).set('Content-Range', `bytes ${start}-${end}/${size}`);
        }
        res.set('Content-Length', String(end - start + 1));
        await pipeline(cached.createReadStream({ start, end, autoClose: false }), res);
      } finally {
        await cached.close();
      }
    } catch (error) {
      if (!res.destroyed && !res.headersSent) {
        const status = error.status || (error.code === 'ENOENT' ? 404 : 500);
        if (status === 422 || status >= 500) {
          console.error('Document preview failed:', error);
        }
        // Sandstorm forwards HTTP error bodies as HTML and drops their encoding.
        // compression() honors no-transform; successful previews can still compress.
        res.set('Cache-Control', 'no-store, no-transform');
        res
          .status(status)
          .type('application/json')
          // Also safe if the bridge relabels this JSON as an HTML error page.
          .send(
            JSON.stringify({
              error: status === 500 ? 'Could not generate document preview.' : error.message,
            }).replace(/</g, '\\u003c'),
          );
      }
    } finally {
      await source?.close();
      res.removeListener('close', abort);
    }
  };
};
