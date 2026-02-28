import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import fetch from 'fetch';

const outstandingRequests = {};
let powerboxInitDone = false;
let nextRpcId = 1;

function initializePowerboxListener() {
  if (powerboxInitDone) {
    return;
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) {
      return;
    }

    const response = event.data || {};
    const req = outstandingRequests[response.rpcId];

    if (!req) {
      return;
    }

    window.clearTimeout(req.timeout);
    delete outstandingRequests[response.rpcId];

    if (response.error || response.canceled) {
      const error = new Error(response.error || 'Powerbox request was canceled');
      error.payload = response;
      req.reject(error);
      return;
    }

    req.resolve(response);
  });

  powerboxInitDone = true;
}

function powerboxRequest(msg) {
  initializePowerboxListener();

  const rpcId = nextRpcId++;
  const request = { ...msg, rpcId };

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      delete outstandingRequests[rpcId];
      reject(new Error('Timed out waiting for Powerbox response'));
    }, 60000);

    outstandingRequests[rpcId] = { resolve, reject, timeout };
    window.parent.postMessage({ powerboxRequest: request }, '*');
  });
}

async function requestPowerboxCapability(queryDescriptor) {
  const response = await powerboxRequest({
    query: [queryDescriptor],
    saveLabel: { defaultText: 'Office document preview converter' },
  });

  const token = response.token || response.requestToken;
  if (!token) {
    throw new Error('Powerbox response did not include a token');
  }

  return token;
}

export default class TypeDocumentComponent extends Component {
  @tracked requestingCapability = false;
  @tracked capabilityError = null;

  get canSandbox() {
    return 'sandbox' in document.createElement('iframe');
  }

  get errored() {
    return this.args.model.previewFailed;
  }

  get needsCapability() {
    return this.args.model.previewNeedsCapability;
  }

  get previewBlobUrl() {
    return this.args.model.previewBlobUrl;
  }

  get canRequestCapability() {
    return Boolean(this.args.model.previewPowerboxQueryDescriptor) && !this.requestingCapability;
  }

  get capabilityErrorMessage() {
    return this.capabilityError;
  }

  @action
  async requestCapability() {
    if (!this.canRequestCapability) {
      return;
    }

    this.capabilityError = null;
    this.requestingCapability = true;

    try {
      const token = await requestPowerboxCapability(this.args.model.previewPowerboxQueryDescriptor);
      const response = await fetch('/api/powerbox/office-preview/claim', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
        },
        body: token,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Claim failed with status ${response.status}`);
      }

      await this.args.model.reload();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this.capabilityError = err?.message || 'Failed to connect document preview capability';
      this.args.model.previewNeedsCapability = true;
      this.args.model.previewFailed = false;
    } finally {
      this.requestingCapability = false;
    }
  }
}
