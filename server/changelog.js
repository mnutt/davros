module.exports = function(req, res, next) {
  res.sendfile('CHANGELOG.md', {root: __dirname + '/..'});
};
