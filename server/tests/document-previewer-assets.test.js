/* eslint-env node */

const fs = require('fs');
const path = require('path');

const PREVIEWER_DIR = path.resolve(__dirname, '../../public/document-previewer');
const WORKER_PATTERNS = [/\bnew\s+Worker\s*\(/, /\bSharedWorker\s*\(/, /\bimportScripts\s*\(/];

function walkFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }

    return [fullPath];
  });
}

describe('document previewer assets', function () {
  it('do not construct web workers', function () {
    const scriptFiles = walkFiles(PREVIEWER_DIR).filter((filePath) => {
      return filePath.endsWith('.js') || filePath.endsWith('.html');
    });

    for (const filePath of scriptFiles) {
      const source = fs.readFileSync(filePath, 'utf8');
      for (const pattern of WORKER_PATTERNS) {
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it('is self-contained for sandboxed iframe loading', function () {
    const source = fs.readFileSync(path.join(PREVIEWER_DIR, 'index.html'), 'utf8');

    expect(source).not.toMatch(/<script[^>]+src=/i);
    expect(source).not.toMatch(/<link[^>]+href=/i);
    expect(source).not.toMatch(/\bimport\s*\(/);
    expect(source).not.toMatch(/\bfetch\s*\(\s*["']data:/);
    expect(source).not.toMatch(/on the main thread/i);
    expect(source).not.toMatch(/without workers/i);
    expect(source).toMatch(/data:application\/wasm/);
  });
});
