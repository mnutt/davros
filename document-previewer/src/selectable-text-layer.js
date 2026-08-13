export function appendCanvasFrame(parent, canvas, cssWidth, cssHeight, runs) {
  const frame = document.createElement('div');
  frame.className = 'ooxml-page-frame';
  frame.style.width = `${cssWidth}px`;
  frame.style.aspectRatio = `${cssWidth} / ${cssHeight}`;

  const canvasHost = document.createElement('div');
  canvasHost.className = 'ooxml-canvas-host';
  canvasHost.append(canvas);

  const textLayer = document.createElement('div');
  textLayer.className = 'ooxml-text-layer';
  textLayer.style.width = `${cssWidth}px`;
  textLayer.style.height = `${cssHeight}px`;
  for (const item of runs) {
    textLayer.append(item.kind === 'docx' ? docxTextSpan(item.run) : pptxTextSpan(item.run));
  }

  frame.append(canvasHost, textLayer);
  parent.append(frame);
  observeTextLayerScale(frame, textLayer, cssWidth);
}

export function canvasCssSize(canvas, dpr) {
  return {
    width: parseCssPixel(canvas.style.width) ?? canvas.width / dpr,
    height: parseCssPixel(canvas.style.height) ?? canvas.height / dpr,
  };
}

function observeTextLayerScale(frame, textLayer, cssWidth) {
  if (!window.ResizeObserver || cssWidth <= 0) {
    return;
  }

  const updateScale = () => {
    textLayer.style.transform = `scale(${frame.clientWidth / cssWidth})`;
  };

  updateScale();

  const observer = new ResizeObserver(updateScale);
  observer.observe(frame);
}

function docxTextSpan(run) {
  const span = baseTextSpan(run);
  setStyle(span, {
    left: `${run.x}px`,
    top: `${run.y}px`,
    width: `${Math.max(run.w, 1)}px`,
    height: `${Math.max(run.h, run.fontSize)}px`,
    font: run.font,
    fontSize: `${run.fontSize}px`,
    lineHeight: `${run.h}px`,
    letterSpacing: run.letterSpacingPx === undefined ? undefined : `${run.letterSpacingPx}px`,
    transform: run.transform,
  });
  return span;
}

function pptxTextSpan(run) {
  const x = run.shapeX + run.inShapeX;
  const y = run.shapeY + run.inShapeY;
  const rotation = (run.rotation ?? 0) + (run.textBodyRotation ?? 0);
  const transformOriginX = run.shapeX + run.shapeW / 2 - x;
  const transformOriginY = run.shapeY + run.shapeH / 2 - y;
  const span = baseTextSpan(run);

  setStyle(span, {
    left: `${x}px`,
    top: `${y}px`,
    width: `${Math.max(run.w, 1)}px`,
    height: `${Math.max(run.h, run.fontSize)}px`,
    font: run.font,
    fontSize: `${run.fontSize}px`,
    lineHeight: `${run.h}px`,
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    transformOrigin: rotation ? `${transformOriginX}px ${transformOriginY}px` : undefined,
  });

  return span;
}

function baseTextSpan(run) {
  const span = document.createElement('span');
  span.className = 'ooxml-text-run';
  span.textContent = run.text;
  const title = hyperlinkTitle(run.hyperlink);

  if (title) {
    span.title = title;
  }

  return span;
}

function setStyle(element, values) {
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) {
      element.style[key] = value;
    }
  }
}

function parseCssPixel(value) {
  if (!value.endsWith('px')) {
    return undefined;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function hyperlinkTitle(target) {
  if (!target || typeof target !== 'object') {
    return undefined;
  }

  if (typeof target.url === 'string') {
    return target.url;
  }

  if (typeof target.ref === 'string') {
    return target.ref;
  }

  return undefined;
}
