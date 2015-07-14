var jsDAV_ServerPlugin = require("jsdav/lib/DAV/plugin");
var AsyncEventEmitter = require("jsdav/lib/shared/asyncEvents").EventEmitter;
var Url = require("url");

var jsDAV_Auth_Dir_Plugin = module.exports = jsDAV_ServerPlugin.extend({
  name: "auth_dir",

  authBackend: null,

  realm: null,

  initialize: function(handler) {
    this.handler = handler;
    this.authBackend = null;
    this.realm = "jsDAV";

    handler.addEventListener("beforeMethod",
                             this.beforeMethod.bind(this),
                             AsyncEventEmitter.PRIO_HIGH);
  },

  beforeMethod: function(e, method) {
    var user = this.handler.httpRequest.headers['Authorization'] || "HELLO";
    var newBase = [this.handler.server.baseUri,
                   user].join('/');
    var currentUri = [newBase,
                      this.handler.getRequestUri()].join('/');

    currentUri = Url.parse(currentUri).pathname
    if (currentUri.indexOf(newBase) === 0 || currentUri + "/" === newBase) {
      this.handler.httpRequest.url = currentUri;
    } else {
      throw new Exc.Forbidden("Requested uri is out of base uri for user " + user);
    }

    console.log(currentUri);

    e.next();
  }
});
