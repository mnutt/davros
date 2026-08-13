import { registerFileBytes } from 'node:fs';
import docxWasmUrl from '@davros-ooxml/docx-parser-wasm';
import pptxWasmUrl from '@davros-ooxml/pptx-parser-wasm';
import xlsxWasmUrl from '@davros-ooxml/xlsx-parser-wasm';

let preloadPromise;

export function ensureOoxmlWasmReady() {
  preloadPromise ??= Promise.all([
    loadWasm('docx_parser_bg.wasm', docxWasmUrl),
    loadWasm('pptx_parser_bg.wasm', pptxWasmUrl),
    loadWasm('xlsx_parser_bg.wasm', xlsxWasmUrl),
  ]).then(() => undefined);

  return preloadPromise;
}

async function loadWasm(name, url) {
  registerFileBytes(name, await loadBytes(url));
}

async function loadBytes(url) {
  if (url.startsWith('data:')) {
    return decodeDataUrl(url);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load WASM: HTTP ${response.status}`);
  }

  return response.arrayBuffer();
}

function decodeDataUrl(url) {
  const commaIndex = url.indexOf(',');

  if (commaIndex === -1) {
    throw new Error('Invalid embedded WASM data URL');
  }

  const metadata = url.slice(0, commaIndex);
  const payload = url.slice(commaIndex + 1);
  const binary = metadata.includes(';base64') ? atob(payload) : decodeURIComponent(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}
