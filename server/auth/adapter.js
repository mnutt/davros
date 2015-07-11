var jsDAV_Auth_Backend_AbstractDigest = require("jsdav/lib/DAV/plugins/auth/abstractDigest");

/**
 * This is an authentication backend that uses a postgres database to manage passwords.
 */
var jsDAV_Auth_Backend_Postgre = module.exports = jsDAV_Auth_Backend_AbstractDigest.extend({
  initialize: function (authBackend, tableName) {
    jsDAV_Auth_Backend_AbstractDigest.initialize.call(this);
    this.authBackend = authBackend;
    this.tableName = tableName || "users";
  },

  /**
   * Returns a users' information
   *
   * @param  {string} realm
   * @param  {string} username
   * @return {string}
   */
  getDigestHash: function (realm, username, cbdigest) {
    var queryText =
          this.authBackend.all(
            "SELECT * FROM " + this.tableName + " WHERE username=?",
            [username],
            function(err, rows) {
              if (err)
                return cbdigest(err);

              if (rows.length > 0)
                return cbdigest(null, rows[0].password);

              if (rows.length == 0)
                return cbdigest(null, undefined);

              return cbdigest("Unexpected number of rows: " + rows.length);
            }
          );
  }
});
