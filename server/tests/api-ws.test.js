/* eslint-env node */

const apiWs = require('../api-ws');

describe('api ws path normalization', function () {
  it('normalizes root path', function () {
    expect(apiWs.normalizePath('/')).toBe('');
    expect(apiWs.normalizePath('')).toBe('');
  });

  it('normalizes encoded and unencoded directory names to a canonical value', function () {
    expect(apiWs.normalizePath('/test dir')).toBe('test%20dir');
    expect(apiWs.normalizePath('test dir')).toBe('test%20dir');
    expect(apiWs.normalizePath('test%20dir')).toBe('test%20dir');
  });

  it('normalizes each segment while preserving separators', function () {
    expect(apiWs.normalizePath('/foo bar/baz qux/')).toBe('foo%20bar/baz%20qux');
  });
});
