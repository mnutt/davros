const WASM_DOCUMENT_PREVIEW_EXTENSIONS = new Set(['docx', 'xlsx', 'pptx']);

function normalizeExtension(extension) {
  return String(extension || '').toLowerCase().replace(/^\./, '');
}

export function wasmDocumentPreviewSupported(extension) {
  return WASM_DOCUMENT_PREVIEW_EXTENSIONS.has(normalizeExtension(extension));
}

export function documentPreviewKind(extension) {
  if (wasmDocumentPreviewSupported(extension)) {
    return 'wasm';
  }

  return null;
}
