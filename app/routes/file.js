import { service } from '@ember/service';
import Route from '@ember/routing/route';
import File from '../models/file';

async function decodeWsPayload(payload) {
  if (typeof payload === 'string') {
    return payload;
  }

  if (payload && typeof payload.text === 'function') {
    return await payload.text();
  }

  if (payload instanceof ArrayBuffer) {
    return new TextDecoder().decode(payload);
  }

  if (ArrayBuffer.isView(payload)) {
    return new TextDecoder().decode(payload.buffer);
  }

  return payload;
}

function getSocketUrl() {
  const wsProtocol = document.location.protocol === 'https:' ? 'wss://' : 'ws://';

  try {
    const override = window.localStorage.getItem('DAVROS_WS_URL');
    if (override) {
      return override;
    }
  } catch (_error) {
    // ignore localStorage errors
  }

  // In local Vite dev, connect directly to backend websocket because some
  // browser/proxy combinations can connect but still drop forwarded messages.
  if (
    document.location.port === '4200' &&
    (document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1')
  ) {
    return `${wsProtocol}${document.location.hostname}:8000/ws-files`;
  }

  return `${wsProtocol}${document.location.host}/ws-files`;
}

const socketUrl = getSocketUrl();

export default class FileRoute extends Route {
  templateName = 'file';
  @service router;
  @service websockets;
  socket = null;
  reloadPromise = null;
  reloadRequestedWhilePending = false;

  setupWebsockets() {
    if (this.socket) {
      return;
    }

    this.socket = this.websockets.socketFor(socketUrl);
    this.socket.on('message', this.messageHandler, this);
    this.socket.on('open', this.socketOpenHandler, this);
  }

  activate() {
    this.setupWebsockets();
    super.activate(...arguments);
  }

  deactivate() {
    if (this.socket) {
      this.socket.off('message', this.messageHandler, this);
      this.socket.off('open', this.socketOpenHandler, this);
      this.socket = null;
    }

    super.deactivate(...arguments);
  }

  socketOpenHandler() {
    this.reload();
  }

  // This is used by both `FileRoute` and `FilesRoute` (which extends `FileRoute`).
  // `messageHandler` fires twice on every message; in the root directory `FilesRoute`
  // will have a `currentModel` while in nested directories `FileRoute` will.
  async messageHandler(rawMessage) {
    const payload = await decodeWsPayload(rawMessage.data);

    let message;
    try {
      message = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (_error) {
      return;
    }

    const contextPath = this.currentModel && this.currentModel.path;
    const normalizedContext = this.normalizePath(contextPath);
    const normalizedMessage = this.normalizePath(message.file);

    const hasFileField = Object.prototype.hasOwnProperty.call(message, 'file');
    if (hasFileField && typeof contextPath === 'string' && normalizedContext === normalizedMessage) {
      this.reload();
    }
  }

  normalizePath(path) {
    if (!path || path === '/') {
      return '';
    }

    return String(path).replace(/^\/+/, '').replace(/\/+$/, '');
  }

  reload() {
    if (!this.currentModel || typeof this.currentModel.reload !== 'function') {
      return Promise.resolve();
    }

    if (this.reloadPromise) {
      this.reloadRequestedWhilePending = true;
      return this.reloadPromise;
    }

    this.reloadPromise = this.currentModel.reload().finally(() => {
      this.reloadPromise = null;

      if (this.reloadRequestedWhilePending) {
        this.reloadRequestedWhilePending = false;
        this.reload();
      }
    });

    return this.reloadPromise;
  }

  model(params) {
    const path = params.path || '';
    return File.load(path);
  }

  redirect(model) {
    const params = this.paramsFor('file');
    if (model.isDirectory && params.path && !params.path.endsWith('/')) {
      this.router.replaceWith('file', model.path + '/');
    }
  }
}
