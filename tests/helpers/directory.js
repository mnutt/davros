import { click, visit, fillIn, settled } from '@ember/test-helpers';

function generateDirectoryName() {
  return `directory-${Math.random().toString().replace(/\./, '')}`;
}

export async function makeAndEnterNewDirectory(directoryName) {
  await visit('/files/');

  directoryName = await makeDirectory(directoryName);
  await click(`[href*="${directoryName}"]`);

  return directoryName;
}

export async function makeDirectory(name = generateDirectoryName()) {
  await click('[aria-label="New directory"]');

  await fillIn('input[label="Name"]', name);
  await click('.form-actions button[type=submit]');
  await click('.reload'); // fake websocket call

  return name;
}

export async function reload() {
  // This simulates the model reload that would normally be handled by websockets
  await click('.reload');
  await new Promise((res) => setTimeout(res, 300));
  await settled();
}
