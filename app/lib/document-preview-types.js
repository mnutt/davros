const DOCUMENT_PREVIEW_EXTENSIONS = new Set(['docx', 'xlsx', 'pptx']);

function normalizeExtension(extension) {
  return String(extension || '').toLowerCase().replace(/^\./, '');
}

export function documentPreviewKind(extension) {
  if (DOCUMENT_PREVIEW_EXTENSIONS.has(normalizeExtension(extension))) {
    return 'server';
  }

  return null;
}
