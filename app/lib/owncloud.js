// Duplicated from server/dav/capabilities.js for now

const body = JSON.stringify({
  installed: true,
  maintenance: false,
  version: "9.1.0.14",
  versionstring: "9.1.0 RC4",
  "edition": ""
});

export default {
  resources: {
    "/status.php": {
      type: "text/json",
      language: "en",
      body
    }
  },
  options: {
    dav: ["1", "2", "3", 'mkcol-extended']
  }
};
