export function getImageBlob(type = 'image/png') {
  return new Promise((resolve) => {
    let canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.font = '48px serif';
    ctx.fillText('Hello World', 50, 50);
    canvas.toBlob(resolve, type);
  });
}

export async function makeImage(name = 'test.png', type = 'image/png') {
  const blob = await getImageBlob(type);
  return new File([blob], name, { type });
}
