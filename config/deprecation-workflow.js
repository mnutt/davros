/* eslint-disable no-undef */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [{ handler: 'silence', matchId: 'ember-polyfills.deprecate-assign' }],
};
