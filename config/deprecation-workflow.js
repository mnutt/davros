self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "deprecated-run-loop-and-computed-dot-access" },
    { handler: "silence", matchId: "ember-global" },
    { handler: "silence", matchId: "manager-capabilities.modifiers-3-13" },
    { handler: "silence", matchId: "routing.transition-methods" }
  ]
};
