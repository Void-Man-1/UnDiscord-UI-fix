import { log } from './log';

function readLocalStorageJson(key) {
  const iframe = document.createElement('iframe');
  iframe.hidden = true;
  document.body.appendChild(iframe);
  try {
    const value = iframe.contentWindow?.localStorage?.getItem(key);
    return value === null ? null : JSON.parse(value);
  } finally {
    iframe.remove();
  }
}

function findWebpackExport(methodName) {
  const webpackChunks = window.webpackChunkdiscord_app;
  if (!webpackChunks?.push) return null;

  let webpackRequire;
  const chunkId = `undiscord_${Date.now()}_${Math.random()}`;
  webpackChunks.push([[chunkId], {}, require => { webpackRequire = require; }]);
  webpackChunks.pop();

  if (!webpackRequire?.c) return null;
  for (const module of Object.values(webpackRequire.c)) {
    const candidates = [module?.exports, module?.exports?.default];
    for (const candidate of candidates) {
      try {
        if (typeof candidate?.[methodName] === 'function') return candidate;
      } catch {
        // Some Discord modules expose getters that throw before initialization.
      }
    }
  }
  return null;
}

export function getToken() {
  const storedToken = readLocalStorageJson('token');
  if (storedToken) return storedToken;

  log.info('Could not automatically detect Authorization Token in local storage!');
  log.info('Attempting to grab token using webpack');
  const tokenStore = findWebpackExport('getToken');
  const token = tokenStore?.getToken();
  if (!token) throw new Error('Discord token store was not found.');
  return token;
}

export function getAuthorId() {
  const storedId = readLocalStorageJson('user_id_cache');
  if (storedId) return storedId;

  const userStore = findWebpackExport('getCurrentUser');
  const authorId = userStore?.getCurrentUser()?.id;
  if (!authorId) throw new Error('Discord current-user store was not found.');
  return authorId;
}

export function getGuildId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[1];
  log.error('Could not find the Server ID. Make sure you are viewing a server channel or DM.');
}

export function getChannelId() {
  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
  if (m) return m[2];
  log.error('Could not find the Channel ID. Make sure you are viewing a server channel or DM.');
}

export function fillToken() {
  try {
    return getToken();
  } catch (err) {
    log.verb(err);
    log.error('Could not automatically detect Authorization Token!');
    log.info('Please make sure Undiscord is up to date');
    log.debug('Alternatively, you can try entering a Token manually in the "Advanced Settings" section.');
  }
  return '';
}
