const PREFIX = '[UNDISCORD]';

import { VERSION } from 'process.env';

import themeCss from './ui/theme.css';
import mainCss from './ui/main.css';
import dragCss from './ui/drag.css';
import buttonHtml from './ui/undiscord-button.html';
import undiscordTemplate from './ui/undiscord.html';

import UndiscordCore from './undiscord-core';
import Drag from './utils/drag';
import createElm from './utils/createElm';
import insertCss from './utils/insertCss';
import messagePicker from './utils/messagePicker';
import { getAuthorId, getGuildId, getChannelId, fillToken } from './utils/getIds';

import { log, setLogFn } from './utils/log.js';
import { escapeHTML, replaceInterpolations, msToHMS, toSnowflake } from './utils/helpers';

// -------------------------- User interface ------------------------------- //

// links
const HOME = 'https://github.com/victornpb/undiscord';
const WIKI = 'https://github.com/victornpb/undiscord/wiki';

const undiscordCore = new UndiscordCore();

const ui = {
  undiscordWindow: null,
  undiscordBtn: null,
  logArea: null,
  autoScroll: null,

  // progress handler
  progressMain: null,
  progressIcon: null,
  percent: null,
};
const $ = s => ui.undiscordWindow.querySelector(s);

function initUI() {

  if (document.querySelector('#undiscord, #undiscord-btn')) {
    console.warn(PREFIX, 'Undiscord is already initialized.');
    return;
  }

  insertCss(themeCss);
  insertCss(mainCss);
  insertCss(dragCss);

  // create undiscord window
  const undiscordUI = replaceInterpolations(undiscordTemplate, {
    VERSION,
    HOME,
    WIKI,
  });
  ui.undiscordWindow = createElm(undiscordUI);
  document.body.appendChild(ui.undiscordWindow);

  // enable drag and resize on undiscord window
  new Drag({ elm: ui.undiscordWindow, moveHandle: $('.header') });

  // create Undiscord trash icon
  ui.undiscordBtn = createElm(buttonHtml);
  ui.undiscordBtn.onclick = toggleWindow;

  const isChannelRoute = () => /^\/channels\/(?:@me|\d+)\/\d+\/?$/.test(location.pathname);
  const LAUNCHER_MOUNT_DELAY = 400;
  const LAUNCHER_NATIVE_GAP = 22;
  let launcherMountTimer = null;

  function findChannelHeader() {
    return document.querySelector('#app-mount [aria-label="Channel header"]');
  }

  function findToolbar() {
    const appMount = document.querySelector('#app-mount');
    if (!appMount) return null;

    const channelHeader = findChannelHeader();
    const searchRoot = channelHeader || appMount;
    const classToolbar = Array.from(searchRoot.querySelectorAll('[class]'))
      .find(elm => Array.from(elm.classList).some(className => /toolbar/i.test(className)));
    if (classToolbar) return classToolbar;

    const knownAction = searchRoot.querySelector([
      '[aria-label="Start Voice Call"]',
      '[aria-label="Pinned Messages"]',
      '[aria-label="Notification Settings"]',
      '[aria-label="Hide User Profile"]',
      '[aria-label="Show Member List"]',
    ].join(','));
    return knownAction?.parentElement || null;
  }

  function findToolbarBoundary(toolbar) {
    if (!toolbar) return null;

    // Discord keeps Search at the same right-hand boundary across DMs and servers.
    // Its geometry gives Undiscord a stable anchor without altering the toolbar.
    return Array.from(toolbar.children).find(child => {
      if (child === ui.undiscordBtn) return false;
      return Array.from(child.classList).some(className => /search/i.test(className)) ||
        child.matches('[role="search"], [role="combobox"]') ||
        child.querySelector('[role="search"], [role="combobox"], [aria-label^="Search"]');
    }) || null;
  }

  function findFirstToolbarAction(toolbar, boundary) {
    if (!toolbar) return null;

    const actions = Array.from(toolbar.children)
      .filter(child => child !== ui.undiscordBtn && child !== boundary);
    return actions.find(child => child.getBoundingClientRect().width > 0) || actions[0] || null;
  }

  function findChannelContent() {
    const appMount = document.querySelector('#app-mount');
    if (!appMount) return null;

    // Do not show Undiscord over Discord's loading shell. At least one real
    // channel surface must exist before the launcher is allowed to appear.
    return appMount.querySelector([
      '[data-list-id="chat-messages"]',
      '[class*="messagesWrapper"]',
      '[role="textbox"]',
    ].join(','));
  }

  function clearLauncherMount() {
    if (!launcherMountTimer) return;
    clearTimeout(launcherMountTimer);
    launcherMountTimer = null;
  }

  function hideLauncher() {
    clearLauncherMount();
    ui.undiscordBtn.remove();
  }

  function setWindowOpen(open) {
    ui.undiscordWindow.style.display = open ? '' : 'none';
    ui.undiscordBtn.classList.toggle('undiscord-panel-open', open);
    ui.undiscordBtn.setAttribute('aria-expanded', String(open));
  }

  function positionLauncher(anchor) {
    const rect = anchor.getBoundingClientRect();
    const launcherWidth = 32;

    ui.undiscordBtn.style.left = `${Math.max(8, rect.left - launcherWidth - LAUNCHER_NATIVE_GAP)}px`;
    ui.undiscordBtn.style.top = `${Math.max(8, rect.top + (rect.height - 24) / 2)}px`;
  }

  function mountBtn() {
    if (!isChannelRoute()) {
      hideLauncher();
      setWindowOpen(false);
      return;
    }

    const toolbar = findToolbar();
    const boundary = findToolbarBoundary(toolbar);
    if (!boundary || !findChannelContent()) {
      hideLauncher();
      setWindowOpen(false);
      return;
    }
    const anchor = findFirstToolbarAction(toolbar, boundary) || boundary;

    if (ui.undiscordBtn.isConnected && ui.undiscordBtn.parentElement === document.body) {
      positionLauncher(anchor);
      return;
    }

    if (launcherMountTimer) return;
    launcherMountTimer = setTimeout(() => {
      launcherMountTimer = null;
      if (!isChannelRoute()) return;

      const stableToolbar = findToolbar();
      const stableBoundary = findToolbarBoundary(stableToolbar);
      if (!stableBoundary || !findChannelContent()) return;
      const stableAnchor = findFirstToolbarAction(stableToolbar, stableBoundary) || stableBoundary;

      // This is deliberately outside Discord's toolbar. Reading the toolbar's
      // geometry is enough; no native node is moved, styled, or reparented.
      ui.undiscordBtn.classList.add('undiscord-overlay');
      positionLauncher(stableAnchor);
      document.body.appendChild(ui.undiscordBtn);
    }, LAUNCHER_MOUNT_DELAY);
  }
  mountBtn();
  // watch for changes and re-mount button if necessary
  let observerThrottle = null;
  const observer = new MutationObserver((_mutationsList, _observer) => {
    if (observerThrottle) return;
    observerThrottle = setTimeout(() => {
      observerThrottle = null;
      if (!isChannelRoute()) {
        mountBtn();
        return;
      }
      mountBtn();
    }, 250);
  });
  observer.observe(document.body, { attributes: false, childList: true, subtree: true });
  window.addEventListener('resize', mountBtn);

  function toggleWindow() {
    setWindowOpen(ui.undiscordWindow.style.display === 'none');
  }

  // cached elements
  ui.logArea = $('#logArea');
  ui.autoScroll = $('#autoScroll');
  ui.progressMain = $('#progressBar');
  ui.progressIcon = ui.undiscordBtn.querySelector('progress');
  ui.percent = $('#progressPercent');

  // register event listeners
  $('#hide').onclick = toggleWindow;
  $('#toggleSidebar').onclick = event => {
    const hidden = ui.undiscordWindow.classList.toggle('hide-sidebar');
    event.currentTarget.setAttribute('aria-expanded', String(!hidden));
  };
  $('button#start').onclick = startAction;
  $('button#stop').onclick = stopAction;
  $('button#clear').onclick = () => ui.logArea.innerHTML = '';
  $('button#getAuthor').onclick = () => {
    try {
      const authorId = getAuthorId();
      if (authorId) $('input#authorId').value = authorId;
    } catch (err) {
      log.error('Could not automatically detect your Author ID.', err);
    }
  };
  $('button#getGuild').onclick = () => {
    const guildId = getGuildId();
    if (guildId) $('input#guildId').value = guildId;
    if (guildId === '@me') {
      const channelId = getChannelId();
      if (channelId) $('input#channelId').value = channelId;
    }
  };
  $('button#getChannel').onclick = () => {
    const channelId = getChannelId();
    const guildId = getGuildId();
    if (channelId) $('input#channelId').value = channelId;
    if (guildId) $('input#guildId').value = guildId;
  };
  $('#redact').onchange = event => {
    const enabled = event.target.checked;
    ui.undiscordWindow.classList.toggle('redact', enabled);
    if (enabled) log.warn('Streamer mode is on. It attempts to hide personal information, but you should still check the screen before sharing it.');
  };

  const showPickerPrompt = text => {
    document.querySelector('#undiscord-picker-prompt')?.remove();
    const prompt = document.createElement('div');
    prompt.id = 'undiscord-picker-prompt';
    prompt.setAttribute('role', 'status');
    prompt.textContent = `${text} Press Escape to cancel.`;
    document.body.appendChild(prompt);
    return () => prompt.remove();
  };
  $('#pickMessageAfter').onclick = async () => {
    const dismissPrompt = showPickerPrompt('Select a message. Messages below it will be deleted.');
    toggleWindow();
    const id = await messagePicker.grab('after');
    dismissPrompt();
    if (id) $('input#minId').value = id;
    toggleWindow();
  };
  $('#pickMessageBefore').onclick = async () => {
    const dismissPrompt = showPickerPrompt('Select a message. Messages above it will be deleted.');
    toggleWindow();
    const id = await messagePicker.grab('before');
    dismissPrompt();
    if (id) $('input#maxId').value = id;
    toggleWindow();
  };
  $('button#getToken').onclick = () => {
    const token = fillToken();
    if (token) $('input#token').value = token;
  };

  // sync delays
  $('input#searchDelay').onchange = (e) => {
    const v = parseInt(e.target.value);
    if (v) undiscordCore.options.searchDelay = v;
  };
  $('input#deleteDelay').onchange = (e) => {
    const v = parseInt(e.target.value);
    if (v) undiscordCore.options.deleteDelay = v;
  };

  $('input#searchDelay').addEventListener('input', (event) => {
    $('div#searchDelayValue').textContent = event.target.value + 'ms';
  });
  $('input#deleteDelay').addEventListener('input', (event) => {
    $('div#deleteDelayValue').textContent = event.target.value + 'ms';
  });
  $('div#searchDelayValue').textContent = $('input#searchDelay').value + 'ms';
  $('div#deleteDelayValue').textContent = $('input#deleteDelay').value + 'ms';

  // import json
  const fileSelection = $('input#importJsonInput');
  fileSelection.onchange = async () => {
    try {
      const files = fileSelection.files;

      // No files added
      if (files.length === 0) return log.warn('No file selected.');

      // Get channel id field to set it later
      const channelIdField = $('input#channelId');

      // Force the guild id to be ourself (@me)
      const guildIdField = $('input#guildId');
      guildIdField.value = '@me';

      // Set author id in case its not set already
      $('input#authorId').value = getAuthorId();
      const file = files[0];
      const text = await file.text();
      const json = JSON.parse(text);
      const channelIds = Object.keys(json).filter(id => /^\d{16,22}$/.test(id));
      if (channelIds.length === 0) throw new Error('The archive did not contain any valid Discord channel IDs.');
      channelIdField.value = channelIds.join(',');
      log.info(`Loaded ${channelIds.length} channels.`);
    } catch(err) {
      log.error('Error parsing file!', err);
    }
  };

  // redirect console logs to inside the window after setting up the UI
  setLogFn(printLog);

  setupUndiscordCore();
}

function printLog(type = '', args) {
  const logTypes = new Set(['debug', 'info', 'verb', 'warn', 'error', 'success']);
  const safeType = logTypes.has(type) ? type : 'info';
  const maxLogEntries = 5000;
  const allowedMarkup = /&lt;(\/?(?:x|sup|b|i))&gt;/g;
  const escapedEntity = /&amp;(amp|lt|gt|quot|#039);/g;
  const serialize = value => {
    if (typeof value !== 'object' || value === null) return String(value);

    if (value instanceof Error) {
      return value.stack || `${value.name}: ${value.message}`;
    }

    const seen = new WeakSet();
    try {
      return JSON.stringify(value, (_key, nestedValue) => {
        if (nestedValue instanceof Error) {
          return {
            name: nestedValue.name,
            message: nestedValue.message,
            stack: nestedValue.stack,
          };
        }
        if (typeof nestedValue === 'object' && nestedValue !== null) {
          if (seen.has(nestedValue)) return '[Circular]';
          seen.add(nestedValue);
        }
        return nestedValue;
      }, 2);
    } catch {
      return String(value);
    }
  };
  const html = Array.from(args)
    .map(value => {
      const rendered = escapeHTML(serialize(value))
        .replace(allowedMarkup, '<$1>')
        .replace(escapedEntity, '&$1;');
      return typeof value === 'object' && value !== null
        ? `<span class="log-object">${rendered}</span>`
        : rendered;
    })
    .join('\t');
  ui.logArea.insertAdjacentHTML('beforeend', `<div class="log log-${safeType}">${html}</div>`);
  while (ui.logArea.childElementCount > maxLogEntries) ui.logArea.firstElementChild.remove();
  if (ui.autoScroll.checked) ui.logArea.scrollTop = ui.logArea.scrollHeight;
  if (safeType === 'error') console.error(PREFIX, ...Array.from(args));
}

function setupUndiscordCore() {

  undiscordCore.onStart = (state, stats) => {
    console.debug(PREFIX, 'Deletion started.', { startedAt: stats.startTime });
    $('#start').disabled = true;
    $('#stop').disabled = false;

    ui.undiscordBtn.classList.add('running');
    ui.progressMain.style.display = 'block';
    ui.percent.style.display = 'block';
  };

  undiscordCore.onProgress = (state, stats) => {
    // console.log(PREFIX, 'onProgress', state, stats);
    let max = state.grandTotal;
    const value = state.delCount + state.failCount;
    max = Math.max(max, value, 0); // clamp max

    // status bar
    const percent = value >= 0 && max ? Math.round(value / max * 100) + '%' : '';
    const elapsed = msToHMS(Date.now() - stats.startTime.getTime());
    const remaining = msToHMS(stats.etr);
    ui.percent.innerHTML = `${percent} (${value}/${max}) Elapsed: ${elapsed} Remaining: ${remaining}`;

    // indeterminate progress bar
    if (max) {
      ui.progressIcon.setAttribute('max', max);
      ui.progressMain.setAttribute('max', max);
      ui.progressIcon.value = value;
      ui.progressMain.value = value;
    } else {
      ui.progressIcon.removeAttribute('value');
      ui.progressMain.removeAttribute('value');
      ui.percent.innerHTML = '...';
    }

    // update delays
    const searchDelayInput = $('input#searchDelay');
    searchDelayInput.value = undiscordCore.options.searchDelay;
    $('div#searchDelayValue').textContent = undiscordCore.options.searchDelay+'ms';

    const deleteDelayInput = $('input#deleteDelay');
    deleteDelayInput.value = undiscordCore.options.deleteDelay;
    $('div#deleteDelayValue').textContent = undiscordCore.options.deleteDelay+'ms';
  };

  undiscordCore.onStop = (state, stats) => {
    console.debug(PREFIX, 'Deletion stopped.', { deleted: state.delCount, failed: state.failCount, endedAt: stats.endTime });
    $('#start').disabled = false;
    $('#stop').disabled = true;
    ui.undiscordBtn.classList.remove('running');
    ui.progressMain.style.display = 'none';
    ui.percent.style.display = 'none';
  };
}

async function startAction() {
  console.log(PREFIX, 'startAction');
  // general
  const authorId = $('input#authorId').value.trim();
  const guildId = $('input#guildId').value.trim();
  const channelIds = [...new Set($('input#channelId').value.trim().split(/\s*,\s*/).filter(Boolean))];
  const includeNsfw = $('input#includeNsfw').checked;
  // filter
  const content = $('input#search').value.trim();
  const hasLink = $('input#hasLink').checked;
  const hasFile = $('input#hasFile').checked;
  const includePinned = $('input#includePinned').checked;
  const pattern = $('input#pattern').value;
  // message interval
  const minId = $('input#minId').value.trim();
  const maxId = $('input#maxId').value.trim();
  // date range
  const minDate = $('input#minDate').value.trim();
  const maxDate = $('input#maxDate').value.trim();
  //advanced
  const searchDelay = parseInt($('input#searchDelay').value.trim());
  const deleteDelay = parseInt($('input#deleteDelay').value.trim());
 
  // validate input
  if (!guildId) return log.error('You must fill the "Server ID" field!');
  if (guildId !== '@me' && !/^\d{16,22}$/.test(guildId)) return log.error('The "Server ID" field is invalid.');
  if (channelIds.length === 0) return log.error('You must fill the "Channel ID" field!');
  if (channelIds.some(id => !/^\d{16,22}$/.test(id))) return log.error('One or more values in the "Channel ID" field are invalid.');
  if (authorId && !/^\d{16,22}$/.test(authorId)) return log.error('The "Author ID" field is invalid.');
  if (minId && !/^\d{16,22}$/.test(minId)) return log.error('The "After message ID" field is invalid.');
  if (maxId && !/^\d{16,22}$/.test(maxId)) return log.error('The "Before message ID" field is invalid.');
  if (minId && maxId && BigInt(minId) >= BigInt(maxId)) return log.error('The "After message ID" must be older than the "Before message ID".');
  if (!Number.isFinite(searchDelay) || searchDelay < 100) return log.error('The search delay must be at least 100ms.');
  if (!Number.isFinite(deleteDelay) || deleteDelay < 50) return log.error('The delete delay must be at least 50ms.');
  if ((minDate && !toSnowflake(minDate)) || (maxDate && !toSnowflake(maxDate))) return log.error('One or more date filters are invalid.');
  if (minDate && maxDate && new Date(minDate).getTime() >= new Date(maxDate).getTime()) return log.error('The "After date" must be earlier than the "Before date".');
  if (pattern) {
    try {
      new RegExp(pattern, 'i');
    } catch (err) {
      return log.error('The regular-expression pattern is invalid. Nothing was deleted.', err);
    }
  }

  if ((minId && minDate) || (maxId && maxDate)) {
    log.warn('A message-ID boundary overrides the matching date boundary.');
  }

  // Resolve the token only after all non-destructive input validation passes.
  const authToken = $('input#token').value.trim() || fillToken();
  if (!authToken) return; // get token already logs an error.

  // clear logArea
  ui.logArea.innerHTML = '';

  undiscordCore.resetState();
  undiscordCore.options = {
    ...undiscordCore.options,
    authToken,
    authorId,
    guildId,
    channelId: channelIds.length === 1 ? channelIds[0] : undefined, // single or multiple channel
    minId: minId || minDate,
    maxId: maxId || maxDate,
    content,
    hasLink,
    hasFile,
    includeNsfw,
    includePinned,
    pattern,
    searchDelay,
    deleteDelay,
    jobDelay: Math.min(1000, searchDelay),
    // maxAttempt: 2,
  };

  // multiple channels
  if (channelIds.length > 1) {
    const jobs = channelIds.map(ch => ({
      guildId: guildId,
      channelId: ch,
    }));

    try {
      await undiscordCore.runBatch(jobs);
    } catch (err) {
      log.error('CoreException', err);
      undiscordCore.stop();
    }
  }
  // single channel
  else {
    try {
      await undiscordCore.run();
    } catch (err) {
      log.error('CoreException', err);
      undiscordCore.stop();
    }
  }
}

function stopAction() {
  console.log(PREFIX, 'stopAction');
  undiscordCore.stop();
}

export default initUI;

// ---- END Undiscord ----
