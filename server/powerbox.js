'use strict';
/* global fetch */

const fs = require('fs-extra');
const http = require('http');
const https = require('https');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');

const POWERBOX_BRIDGE_URL = 'http://http-bridge';
const STATE_ROOT = process.env.SANDSTORM
  ? '/var/davros-state'
  : path.join(os.tmpdir(), 'davros-state');

function headersToObject(headers) {
  if (!headers) return {};
  if (typeof headers.entries === 'function') {
    return Object.fromEntries(headers.entries());
  }
  return { ...headers };
}

function isNodeReadable(value) {
  return Boolean(value) && typeof value.pipe === 'function';
}

function readableFromWeb(body) {
  if (!body) {
    return Readable.from([]);
  }

  if (typeof Readable.fromWeb === 'function') {
    return Readable.fromWeb(body);
  }

  if (typeof body[Symbol.asyncIterator] === 'function') {
    return Readable.from(body);
  }

  return Readable.from([]);
}

function readStreamAsUtf8(stream, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let done = false;
    let total = 0;
    const chunks = [];

    stream.on('data', (chunk) => {
      if (done) {
        return;
      }

      const bytes = Buffer.from(chunk);
      const remaining = maxBytes - total;
      if (remaining <= 0) {
        done = true;
        resolve(Buffer.concat(chunks).toString('utf8'));
        return;
      }

      const slice = bytes.length > remaining ? bytes.slice(0, remaining) : bytes;
      chunks.push(slice);
      total += slice.length;

      if (total >= maxBytes) {
        done = true;
        resolve(Buffer.concat(chunks).toString('utf8'));
      }
    });

    stream.on('error', reject);
    stream.on('end', () => {
      if (!done) {
        resolve(Buffer.concat(chunks).toString('utf8'));
      }
    });
  });
}

async function requestBridge(targetUrl, options = {}) {
  const proxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const errorTextMaxBytes = options.errorTextMaxBytes || 64 * 1024;

  if (!proxy) {
    const fetchOptions = { ...options };
    delete fetchOptions.errorTextMaxBytes;
    if (isNodeReadable(fetchOptions.body)) {
      fetchOptions.duplex = 'half';
    }

    const response = await fetch(targetUrl, fetchOptions);
    return {
      ok: response.ok,
      status: response.status,
      headers: headersToObject(response.headers),
      stream: readableFromWeb(response.body),
      readText: async () => response.text(),
      readJson: async () => response.json(),
      readErrorText: async () => response.text(),
    };
  }

  const proxyUrl = new URL(proxy);
  const target = new URL(targetUrl);
  const transport = proxyUrl.protocol === 'https:' ? https : http;
  const method = options.method || 'GET';
  const headers = { ...(options.headers || {}) };

  // Preserve destination host for Sandstorm HTTP proxy tunneling.
  headers.host = target.host;

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        protocol: proxyUrl.protocol,
        hostname: proxyUrl.hostname,
        port: proxyUrl.port || (proxyUrl.protocol === 'https:' ? 443 : 80),
        method,
        path: targetUrl,
        headers,
      },
      (res) => {
        let textPromise = null;
        let errorTextPromise = null;

        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode || 500,
          headers: res.headers || {},
          stream: res,
          readText: async () => {
            if (!textPromise) {
              textPromise = readStreamAsUtf8(res);
            }
            return textPromise;
          },
          readJson: async () => {
            if (!textPromise) {
              textPromise = readStreamAsUtf8(res);
            }
            return JSON.parse((await textPromise) || '{}');
          },
          readErrorText: async () => {
            if (!errorTextPromise) {
              errorTextPromise = readStreamAsUtf8(res, errorTextMaxBytes);
            }
            return errorTextPromise;
          },
        });
      }
    );

    req.on('error', reject);

    if (isNodeReadable(options.body)) {
      options.body.on('error', reject);
      options.body.pipe(req);
      return;
    }

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function createPowerboxSession(options) {
  const {
    stateFile,
    queryDescriptor,
    bridgeUrl = POWERBOX_BRIDGE_URL,
    capabilityLabel = 'Powerbox capability',
  } = options;

  const capFile = path.join(STATE_ROOT, stateFile);
  let capabilityToken = null;
  let initialized = false;

  async function initialize() {
    if (initialized) return;
    initialized = true;

    try {
      const stored = await fs.readJson(capFile);
      if (stored && typeof stored.capabilityToken === 'string') {
        capabilityToken = stored.capabilityToken;
      }
    } catch (err) {
      if (err && err.code !== 'ENOENT') {
        console.error(`Failed to load ${capabilityLabel} from state dir`, err);
      }
    }
  }

  async function persistCapability(token) {
    await fs.mkdirp(path.dirname(capFile));
    await fs.writeJson(capFile, { capabilityToken: token }, { spaces: 2 });
  }

  async function getCapability() {
    await initialize();
    return capabilityToken;
  }

  async function clearCapability() {
    capabilityToken = null;
    try {
      await fs.remove(capFile);
    } catch (err) {
      if (err && err.code !== 'ENOENT') {
        console.error(`Failed to clear ${capabilityLabel}`, err);
      }
    }
  }

  async function claimCapability(sessionId, requestToken) {
    if (!sessionId) {
      throw new Error('Missing Sandstorm session id');
    }
    if (!requestToken) {
      throw new Error('Missing Powerbox request token');
    }

    const claimResponse = await requestBridge(`${bridgeUrl}/session/${sessionId}/claim`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        requestToken,
        requiredPermissions: [],
      }),
    });

    if (!claimResponse.ok) {
      const body = await claimResponse.readErrorText();
      throw new Error(`Powerbox claim failed (${claimResponse.status}): ${body}`);
    }

    const claimed = await claimResponse.readJson();
    if (!claimed || typeof claimed.cap !== 'string') {
      throw new Error('Powerbox claim did not return capability token');
    }

    capabilityToken = claimed.cap;
    await persistCapability(capabilityToken);

    return capabilityToken;
  }

  return {
    claimCapability,
    clearCapability,
    getCapability,
    getPowerboxQueryDescriptor() {
      return queryDescriptor;
    },
    async postWithCapability(capability, requestOptions = {}) {
      if (!capability) {
        throw new Error(`Missing ${capabilityLabel}`);
      }

      const { endpoint, ...bridgeOptions } = requestOptions;
      const headers = {
        authorization: `Bearer ${capability}`,
        ...(bridgeOptions.headers || {}),
      };
      const normalizedEndpoint = endpoint ? `/${String(endpoint).replace(/^\/+/, '')}` : '';

      return requestBridge(`${bridgeUrl}${normalizedEndpoint}`, {
        ...bridgeOptions,
        headers,
      });
    },
  };
}

module.exports = {
  createPowerboxSession,
  requestBridge,
};
