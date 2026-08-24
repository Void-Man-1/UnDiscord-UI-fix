import test from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeHTML,
  msToHMS,
  queryString,
  replaceInterpolations,
  toSnowflake,
} from '../src/utils/helpers.js';

test('toSnowflake preserves exact 64-bit precision for dates', () => {
  const timestamp = new Date('2026-08-23T00:00:00.000Z').getTime();
  const snowflake = toSnowflake('2026-08-23T00:00:00.000Z');

  assert.match(snowflake, /^\d+$/);
  assert.equal((BigInt(snowflake) >> 22n) + 1420070400000n, BigInt(timestamp));
  assert.equal(toSnowflake(snowflake), snowflake);
  assert.equal(toSnowflake('not-a-date'), null);
});

test('queryString retains repeated filters and escapes values', () => {
  assert.equal(queryString([
    ['has', 'link'],
    ['has', 'file'],
    ['content', 'a & b'],
    ['skip', undefined],
  ]), 'has=link&has=file&content=a%20%26%20b');
});

test('display helpers handle edge cases safely', () => {
  assert.equal(msToHMS(Number.NaN), '0h 0m 0s');
  assert.equal(escapeHTML('<x a="b">\''), '&lt;x a=&quot;b&quot;&gt;&#039;');
  assert.equal(replaceInterpolations('{{ZERO}}/{{EMPTY}}/{{MISSING}}', { ZERO: 0, EMPTY: '' }), '0//{{MISSING}}');
});
