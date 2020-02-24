/* eslint-disable no-console */
const { Buffer } = require('buffer');

const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

exports.handleError = function handleError(err, response) {
  console.error(err.message);
  response.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': pixel.byteLength
  });
  response.end(pixel);
};
