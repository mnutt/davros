function toBlobPart(buffer) {
  if (buffer instanceof ArrayBuffer) {
    return buffer;
  }

  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
}

async function loadImageElement(blob) {
  const url = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const browserCanvasFactory = {
  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.ceil(width));
    canvas.height = Math.max(1, Math.ceil(height));
    return canvas;
  },

  async loadImage(buffer) {
    const blob = new Blob([toBlobPart(buffer)]);

    if ('createImageBitmap' in window) {
      return createImageBitmap(blob);
    }

    return loadImageElement(blob);
  },
};
