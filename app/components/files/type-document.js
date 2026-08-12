import Component from '@glimmer/component';
import { action } from '@ember/object';
import { registerDestructor } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';

export default class TypeDocumentComponent extends Component {
  @tracked previewRequested = false;
  @tracked previewMode = null;
  @tracked previewLoading = false;
  @tracked wasmSession = null;
  @tracked wasmError = null;
  wasmFrame = null;
  wasmReady = false;
  wasmLoadStarted = false;
  wasmAbortController = null;
  previewGeneration = 0;
  previewModel = null;
  previewRevision = null;
  revisionUpdateId = 0;

  constructor() {
    super(...arguments);
    registerDestructor(this, () => {
      this.revisionUpdateId += 1;
      this.previewGeneration += 1;
      this.teardownWasmPreview();
    });
  }

  get canSandbox() {
    return 'sandbox' in document.createElement('iframe');
  }

  get errored() {
    return Boolean(this.wasmError);
  }

  get documentPreviewKind() {
    return this.args.model.documentPreviewKind;
  }

  get canPreviewDocument() {
    return Boolean(this.documentPreviewKind) && !this.previewLoading;
  }

  get previewButtonLabel() {
    return this.previewLoading ? 'Loading...' : 'Preview Document';
  }

  get wasmPreviewActive() {
    return this.previewRequested && this.previewMode === 'wasm';
  }

  get wasmPreviewUrl() {
    if (!this.wasmSession) {
      return null;
    }

    return `/document-previewer/index.html#session=${encodeURIComponent(this.wasmSession)}`;
  }

  get errorMessage() {
    return this.wasmError;
  }

  makeWasmSession() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  ensureWasmListener() {
    window.addEventListener('message', this.handleWasmMessage);
  }

  teardownWasmPreview() {
    window.removeEventListener('message', this.handleWasmMessage);
    this.wasmAbortController?.abort();
    this.wasmAbortController = null;
    this.wasmFrame = null;
    this.wasmReady = false;
    this.wasmLoadStarted = false;
  }

  resetPreviewRequest() {
    this.previewGeneration += 1;
    this.teardownWasmPreview();
    this.wasmSession = null;
    this.wasmError = null;
    this.previewLoading = false;
    this.previewRequested = false;
    this.previewMode = null;
  }

  revisionFor(model, path, mtime) {
    const timestamp = typeof mtime?.getTime === 'function' ? mtime.getTime() : String(mtime || '');
    return `${path || model?.path || ''}:${timestamp}`;
  }

  startPreview(model) {
    const previewMode = model.documentPreviewKind;
    if (!previewMode) {
      return;
    }

    this.previewGeneration += 1;
    this.wasmError = null;
    this.previewLoading = true;
    this.previewRequested = true;
    this.previewMode = previewMode;
    this.previewModel = model;

    this.teardownWasmPreview();
    this.wasmSession = this.makeWasmSession();
    this.ensureWasmListener();
  }

  async sendWasmLoadMessage() {
    if (!this.wasmReady || !this.wasmFrame?.contentWindow || !this.wasmSession) {
      return;
    }

    if (this.wasmLoadStarted) {
      return;
    }

    this.wasmLoadStarted = true;
    const session = this.wasmSession;
    const abortController = new AbortController();
    this.wasmAbortController = abortController;

    let bytes;
    try {
      const response = await fetch(this.args.model.rawPath, {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Could not load document (${response.status})`);
      }

      bytes = await response.arrayBuffer();
    } catch (err) {
      if (abortController.signal.aborted) {
        return;
      }

      this.previewLoading = false;
      this.wasmError = err?.message || 'Could not load document.';
      return;
    }

    if (session !== this.wasmSession || !this.wasmFrame?.contentWindow) {
      return;
    }

    this.wasmFrame.contentWindow.postMessage(
      {
        type: 'document-preview:load',
        session,
        id: `${this.args.model.path}:${this.args.model.mtime.getTime()}`,
        fileName: this.args.model.name,
        source: {
          kind: 'bytes',
          bytes,
        },
      },
      '*',
      [bytes]
    );
  }

  handleWasmMessage = (event) => {
    if (event.source !== this.wasmFrame?.contentWindow) {
      return;
    }

    const message = event.data || {};
    if (!this.wasmSession || message.session !== this.wasmSession) {
      return;
    }

    if (message.type === 'document-preview:ready') {
      this.wasmReady = true;
      void this.sendWasmLoadMessage();
      return;
    }

    if (message.type === 'document-preview:status') {
      this.previewLoading = message.state === 'loading';
      return;
    }

    if (message.type === 'document-preview:error') {
      this.previewLoading = false;
      this.wasmError = message.message || 'There was an error rendering this preview.';
    }
  };

  @action
  previewDocument() {
    if (!this.canPreviewDocument) {
      return;
    }

    this.startPreview(this.args.model);
  }

  @action
  synchronizeModelRevision(_element, model, path, mtime) {
    const updateId = ++this.revisionUpdateId;
    queueMicrotask(() => {
      if (updateId === this.revisionUpdateId) {
        this.applyModelRevision(model, path, mtime);
      }
    });
  }

  applyModelRevision(model, path, mtime) {
    const revision = this.revisionFor(model, path, mtime);

    if (this.previewRevision === null) {
      this.previewModel = model;
      this.previewRevision = revision;
      return;
    }

    if (this.previewModel === model && this.previewRevision === revision) {
      return;
    }

    const previousModel = this.previewModel;
    const refreshActivePreview = previousModel === model && this.previewRequested;
    this.resetPreviewRequest();
    this.previewModel = model;
    this.previewRevision = revision;

    if (refreshActivePreview) {
      this.startPreview(model);
    }
  }

  @action
  registerWasmIframe(element) {
    this.wasmFrame = element;
  }

}
