import test from 'node:test';
import assert from 'node:assert/strict';

import UndiscordCore from '../src/undiscord-core.js';
import { setLogFn } from '../src/utils/log.js';

setLogFn(() => {});

const message = (overrides = {}) => ({
  id: '1519810101668741120',
  channel_id: '1480004029407825974',
  type: 0,
  hit: true,
  pinned: false,
  content: 'hello world',
  timestamp: '2026-06-25T21:02:00.000Z',
  author: { username: 'tester', discriminator: '0' },
  attachments: [],
  ...overrides,
});

const configuredCore = () => {
  const core = new UndiscordCore();
  core.resetState();
  Object.assign(core.options, {
    authToken: 'test-token',
    authorId: '123456789012345678',
    guildId: '@me',
    channelId: '1480004029407825974',
    searchDelay: 1,
    deleteDelay: 1,
    maxAttempt: 2,
  });
  core.state.running = true;
  return core;
};

test('filterResponse tolerates missing hits and honors pinned and regex filters', () => {
  const core = configuredCore();
  core.options.pattern = '^hello';
  core.options.includePinned = false;
  core.state._searchResponse = {
    total_results: 4,
    messages: [
      [message()],
      [message({ id: '2', pinned: true })],
      [message({ id: '3', content: 'goodbye' })],
      [],
    ],
  };

  core.filterResponse();
  assert.deepEqual(core.state._messagesToDelete.map(item => item.id), ['1519810101668741120']);
  assert.deepEqual(core.state._skippedMessages.map(item => item.id), ['2', '3']);
});

test('a malformed core regex fails closed', () => {
  const core = configuredCore();
  core.options.pattern = '[';
  core.state._searchResponse = { total_results: 1, messages: [[message()]] };

  core.filterResponse();
  assert.equal(core.state._messagesToDelete.length, 0);
  assert.equal(core.state._skippedMessages.length, 1);
});

test('search retries indexing and rate limits using finite option delays', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const core = configuredCore();
  const responses = [
    new Response(JSON.stringify({ retry_after: 0.001 }), { status: 202 }),
    new Response(JSON.stringify({ retry_after: 0.001 }), { status: 429 }),
    new Response(JSON.stringify({ total_results: 0, messages: [] }), { status: 200 }),
  ];
  const urls = [];
  globalThis.fetch = async url => {
    urls.push(String(url));
    return responses.shift();
  };

  const result = await core.search();
  assert.equal(result.total_results, 0);
  assert.equal(urls.length, 3);
  assert.ok(urls[0].includes('/api/v9/channels/1480004029407825974/messages/search?'));
  assert.equal(core.stats.throttledCount, 1);
  assert.equal(core.stats.throttledTotalTime, 1);
  assert.ok(Number.isFinite(core.options.searchDelay));
});

test('a timeout and transient server error are retried during search pagination', async t => {
  const originalFetch = globalThis.fetch;
  const entries = [];
  setLogFn((type, args) => entries.push({ type, args: Array.from(args) }));
  t.after(() => {
    globalThis.fetch = originalFetch;
    setLogFn(() => {});
  });

  const core = configuredCore();
  core.state.running = false;
  core.options.askForConfirmation = false;
  core.options.searchRetryDelay = 1;
  core.options.searchRequestRetries = 3;
  let searches = 0;
  let deletes = 0;
  globalThis.fetch = async (_url, options = {}) => {
    if (options.method === 'DELETE') {
      deletes++;
      return new Response(null, { status: 204 });
    }

    searches++;
    if (searches === 1) {
      return new Response(JSON.stringify({ total_results: 2, messages: [[message({ id: '1' })]] }), { status: 200 });
    }
    if (searches === 2) {
      const error = new Error('signal timed out');
      error.name = 'TimeoutError';
      throw error;
    }
    if (searches === 3) return new Response('temporary failure', { status: 503 });
    return new Response(JSON.stringify({ total_results: 1, messages: [[message({ id: '2' })]] }), { status: 200 });
  };

  await core.run();
  assert.equal(searches, 4);
  assert.equal(deletes, 2);
  assert.equal(core.state.delCount, 2);
  assert.ok(entries.some(entry => String(entry.args[0]).includes('search timed out')));
  assert.ok(entries.some(entry => String(entry.args[0]).includes('transient status 503')));
});

test('search treats a forbidden channel as a terminal empty result', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const core = configuredCore();
  globalThis.fetch = async () => new Response('blocked', { status: 403 });

  assert.deepEqual(await core.search(), { total_results: 0, messages: [] });
  assert.equal(core.state.running, true);
});

test('filterResponse excludes undeletable message types and keeps poll results', () => {
  const core = configuredCore();
  core.state._searchResponse = {
    total_results: 3,
    messages: [
      [message({ id: '20', type: 20 })],
      [message({ id: '21', type: 21 })],
      [message({ id: '46', type: 46 })],
    ],
  };

  core.filterResponse();
  assert.deepEqual(core.state._messagesToDelete.map(item => item.id), ['46']);
  assert.deepEqual(core.state._skippedMessages.map(item => item.id), ['20', '21']);
});

test('failed non-JSON deletes are retried and counted as one failure', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const core = configuredCore();
  core.state._messagesToDelete = [message()];
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response('server failure', { status: 500 });
  };

  await core.deleteMessagesFromList();
  assert.equal(calls, 2);
  assert.equal(core.state.delCount, 0);
  assert.equal(core.state.failCount, 1);
  assert.equal(core.state.offset, 1);
});

test('a rate-limited delete retries and records one success', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const core = configuredCore();
  core.state._messagesToDelete = [message()];
  const responses = [
    new Response(JSON.stringify({ retry_after: 0.001 }), { status: 429 }),
    new Response(null, { status: 204 }),
  ];
  globalThis.fetch = async () => responses.shift();

  await core.deleteMessagesFromList();
  assert.equal(core.state.delCount, 1);
  assert.equal(core.state.failCount, 0);
  assert.equal(core.state.offset, 0);
  assert.equal(core.stats.throttledCount, 1);
});

test('a forbidden delete is skipped once without retrying forever', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const core = configuredCore();
  core.state._messagesToDelete = [message()];
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response(JSON.stringify({ message: 'Missing Permissions', code: 50013 }), { status: 403 });
  };

  await core.deleteMessagesFromList();
  assert.equal(calls, 1);
  assert.equal(core.state.failCount, 1);
  assert.equal(core.state.offset, 1);
});

test('stop during an in-flight search prevents later deletion work', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const core = configuredCore();
  let resolveFetch;
  globalThis.fetch = () => new Promise(resolve => { resolveFetch = resolve; });

  const pendingSearch = core.search();
  core.stop();
  resolveFetch(new Response(JSON.stringify({ total_results: 1, messages: [[message()]] }), { status: 200 }));

  assert.equal(await pendingSearch, null);
  assert.equal(core.state.running, false);
});

test('an empty final page logs a compact end-state summary', async t => {
  const originalFetch = globalThis.fetch;
  const entries = [];
  setLogFn((type, args) => entries.push({ type, args: Array.from(args) }));
  t.after(() => {
    globalThis.fetch = originalFetch;
    setLogFn(() => {});
  });

  const core = configuredCore();
  core.state.running = false;
  core.options.askForConfirmation = false;
  globalThis.fetch = async () => new Response(JSON.stringify({ total_results: 0, messages: [] }), { status: 200 });

  await core.run();

  const endState = entries.find(entry => entry.args[0] === 'End state:');
  assert.ok(endState, 'Expected a compact end-state log entry.');
  assert.deepEqual(endState.args, [
    'End state:',
    'iterations=1',
    'total=0',
    'deleted=0',
    'failed=0',
    'offset=0',
  ]);
  assert.ok(endState.args.every(value => typeof value === 'string'));
  assert.equal(entries.some(entry => String(entry.args[0]).startsWith('Waiting ')), false);
});

test('a transient empty page is retried when results are still expected', async t => {
  const originalFetch = globalThis.fetch;
  const entries = [];
  setLogFn((type, args) => entries.push({ type, args: Array.from(args) }));
  t.after(() => {
    globalThis.fetch = originalFetch;
    setLogFn(() => {});
  });

  const core = configuredCore();
  core.state.running = false;
  core.options.askForConfirmation = false;
  let searches = 0;
  let deletes = 0;
  globalThis.fetch = async (_url, options = {}) => {
    if (options.method === 'DELETE') {
      deletes++;
      return new Response(null, { status: 204 });
    }
    searches++;
    return new Response(JSON.stringify(searches === 1
      ? { total_results: 1, messages: [] }
      : { total_results: 1, messages: [[message()]] }), { status: 200 });
  };

  await core.run();
  assert.equal(searches, 2);
  assert.equal(deletes, 1);
  assert.equal(core.state.delCount, 1);
  assert.ok(entries.some(entry => String(entry.args[0]).includes('returned an empty page')));
});
