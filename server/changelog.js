module.exports = function(req, res, next) {
  res.sendFile('CHANGELOG.md', {root: __dirname + '/..'});
};
