const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const { pipeline } = require('node:stream/promises');

const MAX_OUTPUT = 128 * 1024 * 1024;
const MAX_CACHE = 256 * 1024 * 1024;
const CACHE_VERSION = 'davros-preview-0.3.4';

function previewError(message, status = 422) {
  return Object.assign(new Error(message), { status });
}

function createPreviewService({
  cacheDir = path.join(
    process.env.TEMP_STORAGE_PATH || os.tmpdir(),
    'davros-document-previews',
    CACHE_VERSION,
  ),
  nativeDir = process.env.DAVROS_PREVIEW_NATIVE_DIR ||
    path.resolve(__dirname, '../output/native-preview'),
  converterCommand, // Optional test harness; production invokes the native binary directly.
  timeout = 60000,
} = {}) {
  const jobs = new Map();
  let tail = Promise.resolve();

  async function prune() {
    await fsp.mkdir(cacheDir, { recursive: true, mode: 0o700 });
    const entries = await Promise.all(
      (await fsp.readdir(cacheDir)).map(async (name) => {
        const file = path.join(cacheDir, name);
        const stat = await fsp.stat(file);
        if (stat.isDirectory() && name.startsWith('.render-')) {
          await fsp.rm(file, { recursive: true, force: true });
          return null;
        }
        return stat.isFile() ? { file, stat } : null;
      }),
    );
    const files = entries.filter(Boolean);
    files.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);
    let total = 0;
    for (const entry of files) {
      total += entry.stat.size;
      // Leave room for one maximum-size render. Unfinished jobs are removed above.
      if (total > MAX_CACHE - MAX_OUTPUT) {
        await fsp.unlink(entry.file);
      }
    }
  }

  async function run(source, kind, output, signal) {
    signal.throwIfAborted();
    await prune();
    signal.throwIfAborted();
    const workDir = await fsp.mkdtemp(path.join(cacheDir, '.render-'));
    const input = path.join(workDir, `input.${kind}`);
    const scratch = path.join(workDir, 'scratch');
    const partial = path.join(scratch, 'preview.pdf');
    // Copy from the descriptor validated by the API, never reopen the client path.
    try {
      await fsp.mkdir(scratch, { mode: 0o700 });
      await pipeline(
        source.createReadStream({ autoClose: false, start: 0 }),
        fs.createWriteStream(input, { mode: 0o600 }),
        { signal },
      );
    } catch (error) {
      await fsp.rm(workDir, { recursive: true, force: true });
      throw error;
    }
    const command = converterCommand
      ? converterCommand(kind, input, partial)
      : [path.join(nativeDir, 'davros-preview'), input, partial];
    const child = spawn(command[0], command.slice(1), {
      stdio: ['ignore', 'ignore', 'pipe'],
      env: {
        LANG: 'C.UTF-8',
        FONTCONFIG_FILE: path.join(nativeDir, 'fonts.conf'),
        DAVROS_PREVIEW_FONTS: path.join(nativeDir, 'fonts'),
        XDG_CACHE_HOME: path.join(scratch, 'cache'),
        TMPDIR: scratch,
        RAYON_NUM_THREADS: '2',
      },
    });
    let failure;
    let diagnostics = '';
    const stop = (error) => {
      failure ||= error;
      child.kill('SIGKILL');
    };
    const aborted = () => stop(previewError('Preview cancelled.', 499));
    signal.addEventListener('abort', aborted, { once: true });
    if (signal.aborted) aborted();
    const timer = setTimeout(
      () => stop(previewError('Document preview took too long.', 504)),
      timeout,
    );
    const exited = new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code, signal) =>
        code === 0 && !failure
          ? resolve()
          : reject(
              failure ||
                previewError(
                  `Could not render this document (renderer ${signal || `exit ${code}`}). ${diagnostics.trim()}`,
                ),
            ),
      );
    });
    child.stderr.on('data', (chunk) => {
      // Keep the tail: warnings at startup must not hide a later fatal error.
      diagnostics = (diagnostics + chunk.toString()).slice(-8192);
    });
    try {
      await exited;
      const stat = await fsp.stat(partial);
      if (stat.size > MAX_OUTPUT) throw previewError('Document preview is too large.');
      const handle = await fsp.open(partial, 'r');
      try {
        const magic = Buffer.alloc(5);
        await handle.read(magic, 0, 5, 0);
        if (magic.toString() !== '%PDF-') throw previewError('Converter did not produce a PDF.');
      } finally {
        await handle.close();
      }
      await fsp.chmod(partial, 0o600);
      await fsp.rename(partial, output);
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', aborted);
      child.kill('SIGKILL');
      await exited.catch(() => {});
      await fsp.rm(workDir, { recursive: true, force: true });
    }
  }

  // Takes ownership of source, including on cache hits and failures. Shared
  // requests keep the job alive until their last reader cancels.
  async function get(source, key, kind, signal) {
    const output = path.join(cacheDir, key + '.pdf');
    try {
      signal.throwIfAborted();
      const cached = await fsp.open(output, 'r');
      await source.close();
      return cached;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        await source.close();
        throw error;
      }
    }
    let job = jobs.get(key);
    if (job) {
      await source.close();
    } else {
      if (jobs.size >= 4) {
        await source.close();
        throw previewError('Document preview is busy. Please try again shortly.', 503);
      }
      job = { users: 0, controller: new AbortController() };
      job.promise = tail
        .then(async () => {
          await run(source, kind, output, job.controller.signal);
        })
        .finally(async () => {
          await source.close();
          jobs.delete(key);
        });
      tail = job.promise.catch(() => {});
      jobs.set(key, job);
    }
    job.users++;
    let cancel;
    const cancelled = new Promise((_resolve, reject) => {
      cancel = () => reject(previewError('Preview cancelled.', 499));
      signal.addEventListener('abort', cancel, { once: true });
      if (signal.aborted) cancel();
    });
    try {
      await Promise.race([job.promise, cancelled]);
      signal.throwIfAborted();
      return await fsp.open(output, 'r');
    } finally {
      signal.removeEventListener('abort', cancel);
      if (--job.users === 0) job.controller.abort();
    }
  }
  return { get };
}

module.exports = { createPreviewService, previewError };
