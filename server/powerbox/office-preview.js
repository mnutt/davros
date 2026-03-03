'use strict';

const { Readable } = require('stream');
const { createPowerboxSession } = require('../powerbox');

// Packed Cap'n Proto PowerboxDescriptor used by office preview capability matching.
// To regenerate:
//   capnp encode --packed /tmp/office-preview-powerbox.capnp PowerboxDescriptor <<'EOF' | base64 | tr -d '\n'
//   (tags = [(id = 14445827391922490823, value = (protocol = "org.sandstorm.powerbox.office-to-pdf/v1"))], quality = acceptable)
//   EOF
const POWERBOX_QUERY_DESCRIPTOR =
  'EA1QAQEAABEBF1EEAQH/x80lxnnjecgAQAIxBUIBAAD/b3JnLnNhbmQEc3Rvcm0ucG93ZXJib3gub2ZmaWNlLXRvLXBkZi92MQA=';

const officePreviewSession = createPowerboxSession({
  stateFile: 'powerbox-office-preview-cap.json',
  queryDescriptor: POWERBOX_QUERY_DESCRIPTOR,
  capabilityLabel: 'office preview capability',
});

async function convertOfficeToPdf(input, filename, cap) {
  const safeFilename = filename || 'upload';
  const source = Buffer.isBuffer(input) ? Readable.from([input]) : input;

  const conversionResponse = await officePreviewSession.postWithCapability(cap, {
    endpoint: 'preview',
    method: 'POST',
    headers: {
      'content-type': 'application/octet-stream',
      'x-sandstorm-app-filename': safeFilename,
    },
    body: source,
  });

  if (!conversionResponse.ok) {
    const body = await conversionResponse.readErrorText();
    throw new Error(`Office preview conversion failed (${conversionResponse.status}): ${body}`);
  }

  return conversionResponse.stream;
}

function claimRoute() {
  return async function (req, res) {
    const sessionId = req.headers['x-sandstorm-session-id'];
    const requestToken = typeof req.body === 'string' ? req.body : req.body && req.body.requestToken;

    try {
      await officePreviewSession.claimCapability(sessionId, requestToken);
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  };
}

function unlinkRoute() {
  return async function (_req, res) {
    try {
      await officePreviewSession.clearCapability();
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to unlink office preview capability' });
    }
  };
}

module.exports = {
  clearCapability: officePreviewSession.clearCapability,
  claimRoute,
  convertOfficeToPdf,
  getCapability: officePreviewSession.getCapability,
  getPowerboxQueryDescriptor: officePreviewSession.getPowerboxQueryDescriptor,
  unlinkRoute,
};
