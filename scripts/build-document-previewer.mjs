import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const previewerRoot = path.join(root, 'document-previewer');
const outDir = path.join(root, 'tmp/document-previewer-dist');
const publicDir = path.join(root, 'public/document-previewer');
const indexOut = path.join(publicDir, 'index.html');

await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(publicDir, { recursive: true });

await build({
  root: previewerRoot,
  base: './',
  publicDir: false,
  logLevel: 'warn',
  resolve: {
    alias: {
      'node:fs': fileUrl('document-previewer/src/shims/node-fs.js'),
      'node:path': fileUrl('document-previewer/src/shims/node-path.js'),
      'node:url': fileUrl('document-previewer/src/shims/node-url.js'),
    },
  },
  plugins: [inlineOoxmlWasmPlugin()],
  optimizeDeps: {
    exclude: ['@silurus/ooxml', '@silurus/ooxml/docx', '@silurus/ooxml/node', '@silurus/ooxml/pptx'],
  },
  build: {
    outDir,
    emptyOutDir: true,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    modulePreload: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

const html = await inlineHtmlAssets(path.join(outDir, 'index.html'));
validatePreviewer(html);
await fs.writeFile(indexOut, html);
console.log(`Built ${path.relative(root, indexOut)}`);

function fileUrl(relativePath) {
  return path.join(root, relativePath);
}

function inlineOoxmlWasmPlugin() {
  const modules = new Map([
    ['@davros-ooxml/docx-parser-wasm', 'node_modules/@silurus/ooxml/dist/docx_parser_bg.wasm'],
    ['@davros-ooxml/pptx-parser-wasm', 'node_modules/@silurus/ooxml/dist/pptx_parser_bg.wasm'],
    ['@davros-ooxml/xlsx-parser-wasm', 'node_modules/@silurus/ooxml/dist/xlsx_parser_bg.wasm'],
  ]);

  return {
    name: 'davros-inline-ooxml-wasm',
    resolveId(source) {
      return modules.has(source) ? source : null;
    },
    async load(id) {
      const wasmPath = modules.get(id);

      if (!wasmPath) {
        return null;
      }

      const bytes = await fs.readFile(path.join(root, wasmPath));
      return `export default "data:application/wasm;base64,${bytes.toString('base64')}";`;
    },
  };
}

async function inlineHtmlAssets(indexPath) {
  let html = await fs.readFile(indexPath, 'utf8');
  const directory = path.dirname(indexPath);

  html = await replaceAsync(html, /<script type="module" crossorigin src="([^"]+)"><\/script>/g, async (_match, src) => {
    const source = await fs.readFile(path.join(directory, src), 'utf8');
    return `<script type="module">${source}</script>`;
  });

  html = await replaceAsync(html, /<link rel="stylesheet" crossorigin href="([^"]+)">/g, async (_match, href) => {
    const source = await fs.readFile(path.join(directory, href), 'utf8');
    return `<style>${source}</style>`;
  });

  return html;
}

async function replaceAsync(source, pattern, replacer) {
  const matches = [...source.matchAll(pattern)];
  const replacements = await Promise.all(matches.map((match) => replacer(...match)));
  let result = source;

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const match = matches[index];
    result = result.slice(0, match.index) + replacements[index] + result.slice(match.index + match[0].length);
  }

  return result;
}

function validatePreviewer(html) {
  const forbidden = [
    /<script[^>]+src=/i,
    /<link[^>]+href=/i,
    /\bimport\s*\(/,
    /\bnew\s+Worker\s*\(/,
    /\bSharedWorker\s*\(/,
    /\bimportScripts\s*\(/,
    /\bfetch\s*\(\s*["']data:/,
    /on the main thread/i,
    /without workers/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(html)) {
      throw new Error(`Generated document previewer failed validation: ${pattern}`);
    }
  }

  if (!/data:application\/wasm/.test(html)) {
    throw new Error('Generated document previewer does not embed WASM assets.');
  }
}
