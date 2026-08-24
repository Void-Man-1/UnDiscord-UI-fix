import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const script = await readFile(new URL('../deleteDiscordMessages.user.js', import.meta.url), 'utf8');
const channelId = '1480004029407825974';
const authorId = '123456789012345678';

function createDiscordDom({ withHeader = true, path = `/channels/@me/${channelId}` } = {}) {
  const header = withHeader ? `
    <section aria-label="Channel header">
      <div id="dm-actions">
        <div id="phone" role="button" aria-label="Start Voice Call">Phone</div>
        <button aria-label="Pinned Messages">Pinned</button>
        <div class="search-test"><input aria-label="Search current channel"></div>
      </div>
    </section>` : '';
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="app-mount">${header}
      <ol data-list-id="chat-messages">
        <li id="chat-messages-${channelId}-1519810101668741120"><span>attachment-only message</span></li>
      </ol>
    </div>
  </body></html>`, {
    url: `https://discord.com${path}`,
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  });

  dom.window.alert = () => {};
  dom.window.confirm = () => false;
  dom.window.fetch = globalThis.fetch;
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  dom.window.localStorage.setItem('token', JSON.stringify('test-token'));
  dom.window.localStorage.setItem('user_id_cache', JSON.stringify(authorId));
  dom.window.eval(script);
  return dom;
}

async function waitForLauncher(dom) {
  await new Promise(resolve => dom.window.setTimeout(resolve, 450));
  return dom.window.document.querySelector('#undiscord-btn');
}

test('the launcher overlays a stable slot without modifying the native toolbar and all controls work', async () => {
  const dom = createDiscordDom();
  const { document, Event, KeyboardEvent, MouseEvent } = dom.window;
  document.querySelector('#phone').getBoundingClientRect = () => ({ left: 100, top: 20, width: 32, height: 32 });
  const launcher = await waitForLauncher(dom);
  const window = document.querySelector('#undiscord');

  assert.equal(launcher.parentElement, document.body);
  assert.ok(launcher.classList.contains('undiscord-overlay'));
  assert.equal(launcher.style.left, '46px');
  assert.equal(launcher.style.top, '24px');
  assert.equal(document.querySelector('.search-test').previousElementSibling.getAttribute('aria-label'), 'Pinned Messages');
  assert.equal(document.querySelector('#phone').getAttribute('class'), null);
  assert.equal(document.querySelector('#phone').getAttribute('style'), null);
  assert.equal(launcher.tagName, 'BUTTON');
  assert.ok(Array.from(document.querySelectorAll('style')).some(style => style.textContent.includes('#undiscord-btn::before')));
  assert.equal(window.style.display, 'none');
  launcher.click();
  assert.equal(window.style.display, '');
  assert.equal(launcher.getAttribute('aria-expanded'), 'true');
  assert.ok(launcher.classList.contains('undiscord-panel-open'));
  assert.equal(launcher.style.color, '');

  const requiredIds = [
    'hide', 'toggleSidebar', 'start', 'stop', 'clear', 'redact', 'autoScroll',
    'authorId', 'getAuthor', 'guildId', 'getGuild', 'channelId', 'getChannel',
    'includeNsfw', 'importJsonInput', 'search', 'hasLink', 'hasFile', 'includePinned',
    'pattern', 'minId', 'pickMessageAfter', 'maxId', 'pickMessageBefore',
    'minDate', 'maxDate', 'searchDelay', 'deleteDelay', 'token', 'getToken',
    'progressBar', 'progressPercent', 'logArea',
  ];
  for (const id of requiredIds) assert.ok(document.getElementById(id), `Missing #${id}`);

  assert.equal(document.querySelector('#searchDelayValue').textContent, '30000ms');
  assert.equal(document.querySelector('#deleteDelayValue').textContent, '1000ms');
  assert.equal(window.classList.contains('redact'), false);
  assert.equal(document.querySelector('#redact').checked, false);

  document.querySelector('#getChannel').click();
  assert.equal(document.querySelector('#guildId').value, '@me');
  assert.equal(document.querySelector('#channelId').value, channelId);
  document.querySelector('#getAuthor').click();
  assert.equal(document.querySelector('#authorId').value, authorId);
  document.querySelector('#getToken').click();
  assert.equal(document.querySelector('#token').value, 'test-token');

  const sidebarButton = document.querySelector('#toggleSidebar');
  sidebarButton.click();
  assert.ok(window.classList.contains('hide-sidebar'));
  assert.equal(sidebarButton.getAttribute('aria-expanded'), 'false');
  sidebarButton.click();

  const redact = document.querySelector('#redact');
  redact.checked = true;
  redact.dispatchEvent(new Event('change', { bubbles: true }));
  assert.ok(window.classList.contains('redact'));
  assert.match(document.querySelector('#logArea').textContent, /Streamer mode is on/);
  redact.checked = false;
  redact.dispatchEvent(new Event('change', { bubbles: true }));
  assert.ok(!window.classList.contains('redact'));

  document.querySelector('#pickMessageAfter').click();
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  assert.equal(window.style.display, 'none');
  assert.equal(document.body.className, '');
  assert.match(document.querySelector('#undiscord-picker-prompt').textContent, /Press Escape to cancel/);
  document.querySelector(`[id^="chat-messages-${channelId}-"] span`).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  assert.equal(document.querySelector('#minId').value, '1519810101668741120');
  assert.equal(window.style.display, '');
  assert.equal(document.querySelector('#undiscord-picker-prompt'), null);

  document.querySelector('#pickMessageBefore').click();
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  assert.equal(window.style.display, 'none');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await new Promise(resolve => dom.window.setTimeout(resolve, 0));
  assert.equal(document.querySelector('#maxId').value, '');
  assert.equal(window.style.display, '');
  assert.equal(document.querySelector('#undiscord-picker-prompt'), null);

  document.querySelector('#clear').click();
  assert.equal(document.querySelector('#logArea').textContent, '');
  document.querySelector('#hide').click();
  assert.equal(window.style.display, 'none');
  assert.equal(launcher.getAttribute('aria-expanded'), 'false');
  assert.ok(!launcher.classList.contains('undiscord-panel-open'));
  assert.equal(launcher.style.color, '');
  dom.window.close();
});

test('the launcher stays hidden while loading, then mounts without entering the toolbar', async () => {
  const dom = createDiscordDom({ withHeader: false });
  const { document } = dom.window;
  assert.equal(document.querySelector('#undiscord-btn'), null);

  const header = document.createElement('section');
  header.setAttribute('aria-label', 'Channel header');
  header.innerHTML = '<div><div id="late-phone" role="button" aria-label="Start Voice Call">Phone</div><div class="search-test"><input aria-label="Search current channel"></div></div>';
  document.querySelector('#app-mount').prepend(header);
  await new Promise(resolve => dom.window.setTimeout(resolve, 750));

  const launcher = document.querySelector('#undiscord-btn');
  assert.equal(launcher.parentElement, document.body);
  assert.ok(document.querySelector('#late-phone').nextElementSibling.classList.contains('search-test'));
  assert.ok(launcher.classList.contains('undiscord-overlay'));
  dom.window.close();
});

test('the launcher never flashes over a channel loading shell', async () => {
  const dom = createDiscordDom({ withHeader: false });
  const { document } = dom.window;
  await new Promise(resolve => dom.window.setTimeout(resolve, 3500));
  assert.equal(document.querySelector('#undiscord-btn'), null);
  dom.window.close();
});

test('the launcher keeps the same gap before the first native server action', async () => {
  const serverId = '123456789012345678';
  const dom = createDiscordDom({ withHeader: false, path: `/channels/${serverId}/${channelId}` });
  const { document } = dom.window;
  const header = document.createElement('section');
  header.setAttribute('aria-label', 'Channel header');
  header.innerHTML = `
    <div class="toolbar-test">
      <button id="server-first" aria-label="Threads">Threads</button>
      <button id="server-second" aria-label="Pinned Messages">Pinned</button>
      <div class="search-test"><input aria-label="Search server"></div>
    </div>`;
  document.querySelector('#app-mount').prepend(header);
  document.querySelector('#server-first').getBoundingClientRect = () => ({ left: 140, top: 20, width: 32, height: 32 });
  await new Promise(resolve => dom.window.setTimeout(resolve, 750));

  const launcher = document.querySelector('#undiscord-btn');
  assert.equal(launcher.parentElement, document.body);
  assert.ok(launcher.classList.contains('undiscord-overlay'));
  assert.equal(document.querySelector('#server-second').nextElementSibling.className, 'search-test');
  assert.equal(launcher.style.left, '86px');
  assert.equal(140 - (parseInt(launcher.style.left) + 32), 22);
  assert.equal(document.querySelector('#server-first').getAttribute('style'), null);
  assert.equal(document.querySelector('#server-second').getAttribute('style'), null);
  dom.window.close();
});

test('a malformed regex is rejected before any network or delete request', async () => {
  const dom = createDiscordDom();
  const { document } = dom.window;
  await waitForLauncher(dom);
  let fetchCalls = 0;
  dom.window.fetch = async () => {
    fetchCalls++;
    throw new Error('fetch should not run');
  };

  document.querySelector('#undiscord-btn').click();
  document.querySelector('#getChannel').click();
  document.querySelector('#getAuthor').click();
  document.querySelector('#pattern').value = '[';
  document.querySelector('#start').click();
  await new Promise(resolve => dom.window.setTimeout(resolve, 10));

  assert.equal(fetchCalls, 0);
  assert.match(document.querySelector('#logArea').textContent, /pattern is invalid/i);
  const errorDetails = document.querySelector('#logArea .log-error .log-object');
  assert.ok(errorDetails, 'Error details should render as a readable block.');
  assert.match(errorDetails.textContent, /SyntaxError/);
  dom.window.close();
});

test('invalid message boundaries are rejected before token discovery or network access', async () => {
  const dom = createDiscordDom();
  const { document } = dom.window;
  await waitForLauncher(dom);
  dom.window.localStorage.clear();
  let fetchCalls = 0;
  dom.window.fetch = async () => {
    fetchCalls++;
    throw new Error('fetch should not run');
  };

  document.querySelector('#undiscord-btn').click();
  document.querySelector('#getChannel').click();
  document.querySelector('#minId').value = 'not-a-snowflake';
  document.querySelector('#start').click();
  await new Promise(resolve => dom.window.setTimeout(resolve, 10));

  const text = document.querySelector('#logArea').textContent;
  assert.equal(fetchCalls, 0);
  assert.match(text, /After message ID.*invalid/i);
  assert.doesNotMatch(text, /Authorization Token|token store/i);
  dom.window.close();
});

test('a live-style run renders readable message and attachment logs', async () => {
  const dom = createDiscordDom();
  const { document } = dom.window;
  await waitForLauncher(dom);
  const apiMessage = {
    id: '1519810101668741120',
    channel_id: channelId,
    type: 0,
    hit: true,
    pinned: false,
    content: 'It\'s <b>literal</b> & visible.',
    timestamp: '2026-06-25T21:02:00.000Z',
    author: { username: 'tester', discriminator: '0' },
    attachments: [{
      id: '1519810101668741121',
      filename: 'photo<&>.png',
      url: 'https://cdn.discordapp.com/large-private-url',
      proxy_url: 'https://media.discordapp.net/large-private-url',
    }],
  };
  let searchCount = 0;
  let deleteCount = 0;
  dom.window.confirm = () => true;
  dom.window.fetch = async (url, options = {}) => {
    if (options.method === 'DELETE') {
      deleteCount++;
      return new Response(null, { status: 204 });
    }
    searchCount++;
    return new Response(JSON.stringify(searchCount === 1
      ? { total_results: 1, messages: [[apiMessage]] }
      : { total_results: 0, messages: [] }), { status: 200 });
  };

  document.querySelector('#undiscord-btn').click();
  document.querySelector('#getChannel').click();
  document.querySelector('#getAuthor').click();
  document.querySelector('#searchDelay').value = '100';
  document.querySelector('#deleteDelay').value = '50';
  document.querySelector('#start').click();

  await new Promise(resolve => dom.window.setTimeout(resolve, 250));

  const text = document.querySelector('#logArea').textContent;
  assert.equal(searchCount, 1);
  assert.equal(deleteCount, 1);
  assert.match(text, /It's <b>literal<\/b> & visible\./);
  assert.match(text, /\[1 attachment: photo<&>\.png\]/);
  assert.doesNotMatch(text, /&#039;|proxy_url|cdn\.discordapp\.com/);
  assert.equal((text.match(/Waiting 0\.10s before next page/g) || []).length, 0);
  assert.match(text, /Deleted 1 messages, 0 failed/);
  assert.match(text, /\[1 of 1\]/);
  assert.equal(document.querySelector('#redact').checked, false);
  dom.window.close();
});

test('batch API permission failures are skipped and restore the idle UI state', async () => {
  const dom = createDiscordDom();
  const { document } = dom.window;
  await waitForLauncher(dom);
  dom.window.fetch = async () => new Response('blocked', { status: 403 });

  document.querySelector('#undiscord-btn').click();
  document.querySelector('#getChannel').click();
  document.querySelector('#getAuthor').click();
  document.querySelector('#channelId').value = `${channelId},1480004029407825975`;
  document.querySelector('#searchDelay').value = '100';
  document.querySelector('#deleteDelay').value = '50';
  document.querySelector('#start').click();
  await new Promise(resolve => dom.window.setTimeout(resolve, 300));

  assert.equal(document.querySelector('#start').disabled, false);
  assert.equal(document.querySelector('#stop').disabled, true);
  assert.equal(document.querySelector('#undiscord-btn').classList.contains('running'), false);
  assert.match(document.querySelector('#logArea').textContent, /Discord denied or cannot perform message search/);
  assert.match(document.querySelector('#logArea').textContent, /Batch finished/);
  assert.doesNotMatch(document.querySelector('#logArea').textContent, /CoreException/);
  dom.window.close();
});

test('leaving a channel hides the panel and removes the launcher', async () => {
  const dom = createDiscordDom();
  const { document } = dom.window;
  await waitForLauncher(dom);
  const launcher = document.querySelector('#undiscord-btn');
  launcher.click();
  assert.equal(document.querySelector('#undiscord').style.display, '');

  dom.window.history.pushState({}, '', '/channels/@me');
  document.body.appendChild(document.createElement('span'));
  await new Promise(resolve => dom.window.setTimeout(resolve, 350));

  assert.equal(document.querySelector('#undiscord').style.display, 'none');
  assert.equal(document.querySelector('#undiscord-btn'), null);
  assert.ok(!launcher.classList.contains('undiscord-panel-open'));
  dom.window.close();
});

test('archive import reports author-detection failures in the log', async () => {
  const dom = createDiscordDom();
  const { document, Event, File } = dom.window;
  await waitForLauncher(dom);
  dom.window.localStorage.removeItem('user_id_cache');
  document.querySelector('#undiscord-btn').click();

  const input = document.querySelector('#importJsonInput');
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: [new File([JSON.stringify({ [channelId]: [] })], 'index.json', { type: 'application/json' })],
  });
  input.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(resolve => dom.window.setTimeout(resolve, 10));

  assert.match(document.querySelector('#logArea').textContent, /Error parsing file/);
  assert.match(document.querySelector('#logArea').textContent, /current-user store was not found/);
  dom.window.close();
});
