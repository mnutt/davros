import Component from '@glimmer/component';
import { action } from '@ember/object';
import { registerDestructor } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';

export default class TypeDocumentComponent extends Component {
  @tracked previewRequested = false;
  @tracked previewLoading = false;
  @tracked previewUrl = null;
  @tracked errorMessage = null;
  previewAbort = null;
  previewModel = null;
  previewRevision = null;
  revisionUpdateId = 0;

  constructor() {
    super(...arguments);
    registerDestructor(this, () => {
      this.revisionUpdateId += 1;
      this.previewAbort?.abort();
    });
  }

  get documentPreviewKind() {
    return this.args.model.documentPreviewKind;
  }

  get canPreviewDocument() {
    return Boolean(this.documentPreviewKind) && !this.previewLoading;
  }

  resetPreviewRequest() {
    this.previewAbort?.abort();
    this.previewAbort = null;
    this.previewUrl = null;
    this.errorMessage = null;
    this.previewLoading = false;
    this.previewRequested = false;
  }

  revisionFor(model, path, mtime) {
    const timestamp = typeof mtime?.getTime === 'function' ? mtime.getTime() : String(mtime || '');
    return `${path || model?.path || ''}:${timestamp}`;
  }

  async startPreview(model) {
    if (!model.documentPreviewKind) return;
    this.resetPreviewRequest();
    this.previewModel = model;
    this.previewRequested = true;
    this.previewLoading = true;
    const controller = new AbortController();
    this.previewAbort = controller;
    const url = `/api/preview-document?path=${encodeURIComponent(model.rawPath)}&revision=${encodeURIComponent(this.revisionFor(model, model.path, model.mtime))}`;
    try {
      // Prepare before navigating so conversion errors remain readable. The PDF
      // viewer then requests the cached file, including byte ranges as needed.
      const response = await fetch(`${url}&prepare=1`, {
        credentials: 'same-origin',
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Could not load preview (${response.status})`);
      }
      if (!controller.signal.aborted) this.previewUrl = url;
    } catch (error) {
      if (!controller.signal.aborted)
        this.errorMessage = error.message || 'Could not load document preview.';
    } finally {
      if (!controller.signal.aborted) this.previewLoading = false;
    }
  }

  @action
  previewDocument() {
    if (this.canPreviewDocument) return this.startPreview(this.args.model);
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
}
