import './styles.css';
import { openDocxDocument } from '@silurus/ooxml/node';
import { parseXlsxAllSheets, makeSourceBufferFetchImage, parsePptx } from '@silurus/ooxml/node';
import { renderSlide } from '@silurus/ooxml/pptx';
import { loadDocument } from './document-source.js';
import { ensureOoxmlWasmReady } from './ooxml-wasm.js';
import { browserCanvasFactory } from './browser-canvas-factory.js';
import { appendCanvasFrame, canvasCssSize } from './selectable-text-layer.js';
import { visibleWorksheetEntries, worksheetPreviewWindow } from './xlsx-workbook.js';

const config = readViewerConfig();
const root = document.getElementById('root');
let renderGeneration = 0;

postToParent({ type: 'document-preview:ready' });
postToParent({ type: 'document-preview:status', state: 'idle' });

window.addEventListener('message', (event) => {
  if (event.source !== window.parent || !isParentToViewerMessage(event.data)) {
    return;
  }

  if (config.parentOrigin && event.origin !== config.parentOrigin) {
    return;
  }

  if (config.session && event.data.session !== config.session) {
    return;
  }

  if (event.data.type === 'document-preview:clear') {
    clearPreview();
    renderMessage('Generating preview...');
    postToParent({ type: 'document-preview:status', state: 'idle' });
    return;
  }

  void renderDocument(event.data);
});

async function renderDocument(message) {
  const generation = ++renderGeneration;
  renderMessage('Loading document...');
  postToParent({ type: 'document-preview:status', id: message.id, state: 'loading' });

  try {
    const document = await loadDocument(message);
    if (generation !== renderGeneration) {
      return;
    }

    await renderLoadedDocument(document, generation);

    if (generation === renderGeneration) {
      postToParent({ type: 'document-preview:status', id: document.id, state: 'loaded' });
    }
  } catch (error) {
    if (generation === renderGeneration) {
      const messageText = error instanceof Error ? error.message : 'Could not render document.';
      renderError(messageText);
      postToParent({ type: 'document-preview:error', id: message.id, message: messageText });
    }
  }
}

async function renderLoadedDocument(loadedDocument, generation) {
  switch (loadedDocument.kind) {
    case 'docx':
      await renderDocx(loadedDocument, generation);
      return;
    case 'xlsx':
      await renderXlsx(loadedDocument, generation);
      return;
    case 'pptx':
      await renderPptx(loadedDocument, generation);
      return;
    default:
      throw new Error(`Preview is not available for ${loadedDocument.fileName}.`);
  }
}

async function renderDocx(loadedDocument, generation) {
  await ensureOoxmlWasmReady();
  assertCurrent(generation);

  const surface = createSurface('document-surface document-surface-docx ooxml-page-list');
  let session;

  try {
    session = await openDocxDocument(loadedDocument.bytes, {
      factory: browserCanvasFactory,
    });

    const dpr = window.devicePixelRatio || 1;

    for (let pageIndex = 0; pageIndex < session.pageCount; pageIndex += 1) {
      assertCurrent(generation);

      const runs = [];
      const canvas = await session.renderPage(pageIndex, {
        dpr,
        onTextRun: (run) => runs.push({ kind: 'docx', run }),
      });
      const size = canvasCssSize(canvas, dpr);
      const page = window.document.createElement('div');
      page.className = 'ooxml-page';
      appendCanvasFrame(page, canvas, size.width, size.height, runs);
      surface.append(page);
    }
  } finally {
    await session?.close();
  }
}

async function renderPptx(loadedDocument, generation) {
  await ensureOoxmlWasmReady();
  assertCurrent(generation);

  const presentation = parsePptx(loadedDocument.bytes);
  const slideCount = Array.isArray(presentation.slides) ? presentation.slides.length : 0;
  const surface = createSurface('document-surface document-surface-pptx ooxml-page-list');
  const containerWidth = surface.clientWidth || window.innerWidth;
  const width = Math.max(320, Math.min(1200, containerWidth - 48));
  const dpr = window.devicePixelRatio || 1;
  const fetchImage = makeSourceBufferFetchImage(loadedDocument.bytes);

  for (let index = 0; index < slideCount; index += 1) {
    assertCurrent(generation);

    const slide = presentation.slides[index];
    if (!slide) {
      continue;
    }

    const cssHeight = Math.round(width * (presentation.slideHeight / presentation.slideWidth));
    const runs = [];
    const canvas = browserCanvasFactory.createCanvas(width, cssHeight);

    await renderSlide(
      canvas,
      slide,
      presentation.slideWidth,
      presentation.slideHeight,
      {
        defaultTextColor: presentation.defaultTextColor,
        dpr,
        fetchImage,
        fetchMedia: async () => new Blob([]),
        hlinkColor: presentation.hlinkColor ?? null,
        majorFont: presentation.majorFont,
        minorFont: presentation.minorFont,
        skipMediaControls: true,
        width,
      },
      (run) => runs.push({ kind: 'pptx', run })
    );

    const page = window.document.createElement('div');
    page.className = 'ooxml-page ooxml-slide';
    appendCanvasFrame(page, canvas, width, cssHeight, runs);
    surface.append(page);
  }
}

async function renderXlsx(loadedDocument, generation) {
  await ensureOoxmlWasmReady();
  assertCurrent(generation);

  const parsed = parseXlsxAllSheets(loadedDocument.bytes);
  const visibleSheets = visibleWorksheetEntries(parsed);

  if (visibleSheets.length === 0) {
    renderMessage('This workbook has no visible sheets.');
    return;
  }

  const surface = createSurface('document-surface document-surface-xlsx ooxml-workbook');

  for (const { sheet, worksheet } of visibleSheets) {
    assertCurrent(generation);
    const section = document.createElement('section');
    section.className = 'ooxml-sheet-section';
    const title = document.createElement('div');
    title.className = 'ooxml-sheet-title';
    title.textContent = sheet.name;
    section.append(title);

    if (worksheet) {
      const { table, truncated } = renderWorksheetTable(worksheet);
      section.append(table);

      if (truncated) {
        const notice = document.createElement('div');
        notice.className = 'ooxml-sheet-notice';
        notice.textContent = 'Preview limited to the first 200 populated rows and 40 columns.';
        section.append(notice);
      }
    } else {
      const notice = document.createElement('div');
      notice.className = 'ooxml-sheet-notice';
      notice.textContent = 'This sheet could not be rendered.';
      section.append(notice);
    }

    surface.append(section);
  }
}

function renderWorksheetTable(worksheet) {
  const { rows, columnCount, truncated } = worksheetPreviewWindow(worksheet);
  const table = document.createElement('table');
  table.className = 'ooxml-sheet';
  const thead = table.createTHead();
  const header = thead.insertRow();
  header.append(document.createElement('th'));

  for (let index = 0; index < columnCount; index += 1) {
    const cell = document.createElement('th');
    cell.textContent = columnName(index + 1);
    header.append(cell);
  }

  const tbody = table.createTBody();
  for (const row of rows) {
    const rowElement = tbody.insertRow();
    const rowHeader = document.createElement('th');
    rowHeader.textContent = String(row.index);
    rowElement.append(rowHeader);

    const cells = new Map(row.cells.map((cell) => [cell.col, cell]));
    for (let index = 0; index < columnCount; index += 1) {
      const cell = rowElement.insertCell();
      cell.textContent = cellText(cells.get(index + 1)?.value);
    }
  }

  return { table, truncated };
}

function cellText(value) {
  if (!value || value.type === 'empty') {
    return '';
  }

  if (value.type === 'text') {
    return value.text ?? '';
  }

  if (value.type === 'number') {
    return String(value.number ?? '');
  }

  if (value.type === 'bool') {
    return value.bool ? 'TRUE' : 'FALSE';
  }

  if (value.type === 'error') {
    return value.error ?? '';
  }

  return '';
}

function columnName(index) {
  let name = '';
  let value = index;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }

  return name;
}

function createSurface(className) {
  root.replaceChildren();
  const surface = document.createElement('div');
  surface.className = className;
  root.append(surface);
  return surface;
}

function renderMessage(message) {
  const element = document.createElement('div');
  element.className = 'viewer-message';
  element.textContent = message;
  root.replaceChildren(element);
}

function renderError(message) {
  const element = document.createElement('div');
  element.className = 'viewer-error';
  element.textContent = message;
  root.append(element);
}

function clearPreview() {
  renderGeneration += 1;
}

function assertCurrent(generation) {
  if (generation !== renderGeneration) {
    throw new Error('Preview was cancelled.');
  }
}

function postToParent(message) {
  const targetOrigin = config.parentOrigin ?? '*';
  window.parent.postMessage({ session: config.session, ...message }, targetOrigin);
}

function isParentToViewerMessage(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (value.type === 'document-preview:clear') {
    return true;
  }

  return (
    value.type === 'document-preview:load' &&
    typeof value.id === 'string' &&
    typeof value.fileName === 'string' &&
    value.source &&
    typeof value.source === 'object' &&
    (value.source.kind === 'url' || value.source.kind === 'bytes')
  );
}

function readViewerConfig() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);

  return {
    parentOrigin: hashParams.get('parentOrigin') || queryParams.get('parentOrigin') || undefined,
    session: hashParams.get('session') || queryParams.get('session') || undefined,
  };
}
