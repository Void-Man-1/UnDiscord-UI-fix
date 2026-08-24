// Helpers
const DISCORD_EPOCH = 1420070400000n;

export const wait = async ms => new Promise(done => setTimeout(done, Math.max(0, Number(ms) || 0)));
export const msToHMS = value => {
  const ms = Math.max(0, Number(value) || 0);
  return `${ms / 3.6e6 | 0}h ${(ms % 3.6e6) / 6e4 | 0}m ${(ms % 6e4) / 1000 | 0}s`;
};
export const escapeHTML = html => String(html).replace(/[&<>"']/g, m => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#039;',
})[m]);
export const redact = str => `<x>${escapeHTML(str)}</x>`;
export const queryString = params => params
  .filter(p => p[1] !== undefined)
  .map(p => p[0] + '=' + encodeURIComponent(p[1]))
  .join('&');
export const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));

/** Convert a datetime-local value to an exact Discord snowflake string. */
export const toSnowflake = value => {
  const input = String(value ?? '').trim();
  if (!input) return '';
  if (/^\d+$/.test(input)) return input;

  const timestamp = new Date(input).getTime();
  if (!Number.isFinite(timestamp) || timestamp < Number(DISCORD_EPOCH)) return null;
  return ((BigInt(timestamp) - DISCORD_EPOCH) << 22n).toString();
};

export const replaceInterpolations = (str, obj, removeMissing = false) => str.replace(/\{\{([\w_]+)\}\}/g, (match, key) => {
  if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== null && obj[key] !== undefined) {
    return String(obj[key]);
  }
  return removeMissing ? '' : match;
});
