module.exports = function (req, res) {
  res.sendFile('CHANGELOG.md', { root: __dirname + '/..' });
};
