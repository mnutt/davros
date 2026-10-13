const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createPreviewService } = require('../document-preview');

describe('preview child lifecycle', () => {
  let dir, input, log, cacheDir;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'davros-preview-service-'));
    input = path.join(dir, 'input');
    log = path.join(dir, 'log');
    cacheDir = path.join(dir, 'cache');
    await fs.writeFile(log, '');
    await fs.writeFile(input, JSON.stringify({ log, delay: 100 }));
  });
  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });
  const converterCommand = (_kind, input, output) => [
    process.execPath,
    path.join(__dirname, 'support/preview-worker-fixture.mjs'),
    input,
    output,
  ];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function readAndClose(handle) {
    try {
      return await handle.readFile('utf8');
    } finally {
      await handle.close();
    }
  }

  it('passes only converter settings and separates read-only input from scratch', async () => {
    const inspection = path.join(dir, 'environment.json');
    await fs.writeFile(input, JSON.stringify({ log, inspectEnvironment: inspection, delay: 1 }));
    const service = createPreviewService({ cacheDir, converterCommand });
    await service.get(await fs.open(input, 'r'), 'environment', 'docx', new AbortController().signal)
      .then(readAndClose);
    const child = JSON.parse(await fs.readFile(inspection, 'utf8'));
    expect(Object.keys(child.env).sort()).toEqual([
      'DAVROS_PREVIEW_FONTS', 'FONTCONFIG_FILE', 'LANG', 'RAYON_NUM_THREADS', 'TMPDIR', 'XDG_CACHE_HOME',
    ]);
    expect(path.dirname(child.output)).toBe(child.env.TMPDIR);
    expect(path.dirname(child.input)).toBe(path.dirname(child.env.TMPDIR));
    expect(child.env.XDG_CACHE_HOME).toBe(path.join(child.env.TMPDIR, 'cache'));
    expect(await fs.readdir(cacheDir)).toEqual(['environment.pdf']);
  });

  it('coalesces duplicate requests and serializes different documents', async () => {
    const service = createPreviewService({ cacheDir, converterCommand });
    const handles = await Promise.all([1, 2, 3].map(() => fs.open(input, 'r')));
    const signal = new AbortController().signal;
    const [first, duplicate, second] = await Promise.all([
      service.get(handles[0], 'first', 'docx', signal).then(readAndClose),
      service.get(handles[1], 'first', 'docx', signal).then(readAndClose),
      service.get(handles[2], 'second', 'docx', signal).then(readAndClose),
    ]);
    expect(first).toBe(duplicate);
    expect(second).toBe(first);
    expect(
      (await fs.readFile(log, 'utf8'))
        .trim()
        .split('\n')
        .map((line) => line.split(' ')[0]),
    ).toEqual(['start', 'end', 'start', 'end']);
    expect(handles.map((handle) => handle.fd)).toEqual([-1, -1, -1]);
  });

  it('kills timed-out children and removes partial cache files', async () => {
    const service = createPreviewService({ cacheDir, converterCommand, timeout: 50 });
    const handle = await fs.open(input, 'r');
    await expect(
      service.get(handle, 'timeout', 'docx', new AbortController().signal),
    ).rejects.toMatchObject({ status: 504 });
    expect(await fs.readdir(cacheDir)).toEqual([]);
    expect(handle.fd).toBe(-1);
    const pid = Number((await fs.readFile(log, 'utf8')).trim().split(' ')[1]);
    if (pid) expect(() => process.kill(pid, 0)).toThrow();
  });

  it('retains the final renderer error after lengthy startup warnings', async () => {
    await fs.writeFile(input, JSON.stringify({ log, fail: true, delay: 1 }));
    const service = createPreviewService({ cacheDir, converterCommand });
    await expect(
      service.get(await fs.open(input, 'r'), 'failure', 'docx', new AbortController().signal),
    ).rejects.toThrow(/renderer exit 1.*Final renderer failure/s);
    expect(await fs.readdir(cacheDir)).toEqual([]);
  });

  it('reports the termination signal when the renderer dies without stderr', async () => {
    await fs.writeFile(input, JSON.stringify({ log, signal: 'SIGKILL', delay: 1 }));
    const service = createPreviewService({ cacheDir, converterCommand });
    await expect(
      service.get(await fs.open(input, 'r'), 'killed', 'docx', new AbortController().signal),
    ).rejects.toThrow(/renderer SIGKILL/);
    expect(await fs.readdir(cacheDir)).toEqual([]);
  });

  it('keeps a shared job alive when one reader cancels', async () => {
    const service = createPreviewService({ cacheDir, converterCommand });
    const controller = new AbortController();
    const handles = await Promise.all([1, 2].map(() => fs.open(input, 'r')));
    const first = service.get(handles[0], 'shared', 'docx', controller.signal);
    const rejection = expect(first).rejects.toMatchObject({ status: 499 });
    const second = service
      .get(handles[1], 'shared', 'docx', new AbortController().signal)
      .then(readAndClose);
    await sleep(30);
    controller.abort();
    await rejection;
    expect(await second).toContain('end');
    expect((await fs.readFile(log, 'utf8')).trim().split('\n')).toHaveLength(2);
  });

  it('cancels abandoned queued work without starting another child', async () => {
    const service = createPreviewService({ cacheDir, converterCommand });
    const handles = await Promise.all([1, 2].map(() => fs.open(input, 'r')));
    const first = service
      .get(handles[0], 'first', 'docx', new AbortController().signal)
      .then(readAndClose);
    const controller = new AbortController();
    const queued = service.get(handles[1], 'queued', 'docx', controller.signal);
    const rejection = expect(queued).rejects.toMatchObject({ status: 499 });
    await sleep(30);
    controller.abort();
    await rejection;
    await first;
    // Queue cleanup closes its source even when nobody is waiting on it.
    for (let attempt = 0; handles[1].fd !== -1 && attempt < 20; attempt++) await sleep(10);
    expect(handles[1].fd).toBe(-1);
    expect((await fs.readFile(log, 'utf8')).trim().split('\n')).toHaveLength(2);
  });
});
