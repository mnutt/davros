module.exports = function(db) {
  db.run("CREATE TABLE users (" +
         "username VARCHAR(50)," +
         "password TEXT" +
         ")");

  db.run("INSERT INTO users (username, password) VALUES($1, $2)",
         ["admin", "6838d8a7454372f68a6abffbdb58911c"]);
};
