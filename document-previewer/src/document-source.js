export async function loadDocument(message) {
  const bytes =
    message.source.kind === 'bytes'
      ? message.source.bytes
      : await fetchDocumentBytes(message.source.url);

  return {
    id: message.id,
    fileName: message.fileName,
    mimeType: message.mimeType,
    kind: detectDocumentKind(message.fileName, message.mimeType),
    bytes,
  };
}

async function fetchDocumentBytes(url) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Could not fetch document (${response.status})`);
  }

  return response.arrayBuffer();
}

export function detectDocumentKind(fileName, mimeType) {
  const normalizedMime = mimeType?.toLowerCase() ?? '';
  const extension = fileName.toLowerCase().split('.').pop() ?? '';

  if (extension === 'docx' || normalizedMime.includes('wordprocessingml')) {
    return 'docx';
  }

  if (extension === 'xlsx' || normalizedMime.includes('spreadsheetml')) {
    return 'xlsx';
  }

  if (
    extension === 'pptx' ||
    normalizedMime.includes('presentationml') ||
    normalizedMime.includes('powerpoint')
  ) {
    return 'pptx';
  }

  return 'unsupported';
}
