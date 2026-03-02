import Service from '@ember/service';
import { registerDestructor } from '@ember/destroyable';

const RECONNECT_DELAY_MS = 1000;

class ManagedSocket {
  #url;
  #ws = null;
  #listeners = new Map();
  #isClosed = false;
  #reconnectTimer = null;

  constructor(url) {
    this.#url = url;
    this.#connect();
  }

  on(eventName, callback, context) {
    const listeners = this.#listeners.get(eventName) ?? [];
    listeners.push({ callback, context });
    this.#listeners.set(eventName, listeners);
  }

  off(eventName, callback, context) {
    const listeners = this.#listeners.get(eventName);
    if (!listeners) {
      return;
    }

    this.#listeners.set(
      eventName,
      listeners.filter((listener) => {
        return listener.callback !== callback || listener.context !== context;
      })
    );
  }

  close() {
    this.#isClosed = true;
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }

    if (this.#ws) {
      this.#ws.close();
      this.#ws = null;
    }
  }

  #connect() {
    this.#ws = new WebSocket(this.#url);
    this.#ws.binaryType = 'arraybuffer';

    for (const eventName of ['open', 'message', 'error']) {
      this.#ws.addEventListener(eventName, (event) => this.#emit(eventName, event));
    }

    this.#ws.addEventListener('close', (event) => {
      this.#emit('close', event);

      if (!this.#isClosed) {
        this.#reconnectTimer = setTimeout(() => {
          this.#reconnectTimer = null;
          this.#connect();
        }, RECONNECT_DELAY_MS);
      }
    });
  }

  #emit(eventName, event) {
    const listeners = this.#listeners.get(eventName) ?? [];
    for (const { callback, context } of listeners) {
      callback.call(context, event);
    }
  }
}

export default class WebsocketsService extends Service {
  #sockets = new Map();

  constructor(...args) {
    super(...args);
    registerDestructor(this, this.#teardown.bind(this));
  }

  socketFor(url) {
    if (!this.#sockets.has(url)) {
      this.#sockets.set(url, new ManagedSocket(url));
    }

    return this.#sockets.get(url);
  }

  #teardown() {
    for (const socket of this.#sockets.values()) {
      socket.close();
    }
    this.#sockets.clear();
  }
}
