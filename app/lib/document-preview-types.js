const DOCUMENT_PREVIEW_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp']);

function normalizeExtension(extension) {
  return String(extension || '').toLowerCase().replace(/^\./, '');
}

export function documentPreviewKind(extension) {
  if (DOCUMENT_PREVIEW_EXTENSIONS.has(normalizeExtension(extension))) {
    return 'server';
  }

  return null;
}
