var Cache = function() {
  this._cache = {};

  return this;
}

Cache.prototype = {
  get: function(key) {
    return this._cache[key];
  },

  set: function(key, value, expires) {
    this._cache[key] = value;
    expires = expires || 60000;

    var self = this;
    setTimeout(function() {
      delete self._cache[key];
    }, expires);
  }
};

module.exports = Cache;
