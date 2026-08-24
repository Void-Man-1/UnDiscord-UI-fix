const PREFIX = '[UNDISCORD]';

import { log } from './utils/log.js';
import {
  wait,
  msToHMS,
  redact,
  queryString,
  ask,
  toSnowflake,
} from './utils/helpers.js';

/**
 * Delete all messages in a Discord channel or DM
 * @author Victornpb <https://www.github.com/victornpb>
 * @see https://github.com/victornpb/undiscord
 */
class UndiscordCore {

  options = {
    authToken: null, // Your authorization token
    authorId: null, // Author of the messages you want to delete
    guildId: null, // Server were the messages are located
    channelId: null, // Channel were the messages are located
    minId: null, // Only delete messages after this, leave blank do delete all
    maxId: null, // Only delete messages before this, leave blank do delete all
    content: null, // Filter messages that contains this text content
    hasLink: null, // Filter messages that contains link
    hasFile: null, // Filter messages that contains file
    includeNsfw: null, // Search in NSFW channels
    includePinned: null, // Delete messages that are pinned
    pattern: null, // Only delete messages that match the regex (insensitive)
    searchDelay: 30000, // Delay each time we fetch for more messages
    deleteDelay: 1000, // Delay between each delete operation
    jobDelay: 1000, // Delay between channels in an archive/batch
    maxAttempt: 2, // Attempts to delete a single message if it fails
    emptyPageRetries: 2, // Retry transient empty pages when results are still expected
    searchRequestTimeout: 60000, // Allow slow Discord search pages to finish
    searchRequestRetries: 3, // Retry transient search network/server failures
    searchRetryDelay: 2000, // Brief cooldown before retrying a failed search request
    askForConfirmation: true,
  };

  state = {
    running: false,
    delCount: 0,
    failCount: 0,
    grandTotal: 0,
    offset: 0,
    iterations: 0,
    emptyPageRetryCount: 0,

    _searchResponse: null,
    _messagesToDelete: [],
    _skippedMessages: [],
    _stopNotified: false,
    _userStopped: false,
  };

  stats = {
    startTime: new Date(), // start time
    endTime: null,
    throttledCount: 0, // how many times you have been throttled
    throttledTotalTime: 0, // the total amount of time you spent being throttled
    lastPing: null, // the most recent ping
    avgPing: null, // average ping used to calculate the estimated remaining time
    etr: 0,
  };

  // events
  onStart = undefined;
  onProgress = undefined;
  onStop = undefined;

  resetState() {
    this.state = {
      running: false,
      delCount: 0,
      failCount: 0,
      grandTotal: 0,
      offset: 0,
      iterations: 0,
      emptyPageRetryCount: 0,

      _searchResponse: null,
      _messagesToDelete: [],
      _skippedMessages: [],
      _stopNotified: false,
      _userStopped: false,
    };

    this.stats = {
      startTime: new Date(),
      endTime: null,
      throttledCount: 0,
      throttledTotalTime: 0,
      lastPing: null,
      avgPing: null,
      etr: 0,
    };

    this.options.askForConfirmation = true;
  }

  /** Automate the deletion process of multiple channels */
  async runBatch(queue) {
    if (this.state.running) return log.error('Already running!');

    log.info(`Running batch with queue of ${queue.length} jobs`);
    let completedJobs = 0;
    let totalDeleted = 0;
    let totalFailed = 0;
    for (let i = 0; i < queue.length; i++) {
      if (i > 0) {
        log.verb(`Waiting ${(this.options.jobDelay / 1000).toFixed(2)}s before next job...`);
        await wait(this.options.jobDelay);
        if (this.state._userStopped) break;
      }

      const job = queue[i];
      log.info('Starting job...', `(${i + 1}/${queue.length})`);

      // set options
      this.options = {
        ...this.options, // keep current options
        ...job, // override with options for that job
      };

      try {
        await this.run(true);
      } catch (err) {
        log.error('Job failed, skipping to the next channel.', err);
      }
      totalDeleted += this.state.delCount;
      totalFailed += this.state.failCount;
      if (this.state._userStopped) break;

      completedJobs++;
      log.info('Job ended.', `(${i + 1}/${queue.length})`);
      if (i < queue.length - 1) {
        this.resetState();
        this.options.askForConfirmation = false;
      }
    }

    log.info(
      this.state._userStopped ? 'Batch stopped by you.' : 'Batch finished.',
      `channels=${completedJobs}/${queue.length}`,
      `deleted=${totalDeleted}`,
      `failed=${totalFailed}`
    );
    this.state.running = false;
    this.notifyStop();
  }

  /** Start the deletion process */
  async run(isJob = false) {
    if (this.state.running && !isJob) return log.error('Already running!');

    this.state.running = true;
    this.state._userStopped = false;
    this.stats.startTime = new Date();

    log.success(`\nStarted at ${this.stats.startTime.toLocaleString()}`);
    log.debug(
      `authorId = "${redact(this.options.authorId)}"`,
      `guildId = "${redact(this.options.guildId)}"`,
      `channelId = "${redact(this.options.channelId)}"`,
      `minId = "${redact(this.options.minId)}"`,
      `maxId = "${redact(this.options.maxId)}"`,
      `hasLink = ${!!this.options.hasLink}`,
      `hasFile = ${!!this.options.hasFile}`,
    );

    if (this.onStart) this.onStart(this.state, this.stats);

    do {
      this.state.iterations++;

      log.verb('Fetching messages...');
      // Search messages
      const searchResult = await this.search();
      if (!this.state.running || !searchResult) break;

      // Process results and find which messages should be deleted
      await this.filterResponse();
      if (this.state._messagesToDelete.length || this.state._skippedMessages.length) {
        this.state.emptyPageRetryCount = 0;
      }

      log.verb(
        `Grand total: ${this.state.grandTotal}`,
        `(Messages in current page: ${this.state._searchResponse.messages.length}`,
        `To be deleted: ${this.state._messagesToDelete.length}`,
        `Skipped: ${this.state._skippedMessages.length})`,
        `offset: ${this.state.offset}`
      );
      this.printStats();

      // Calculate estimated time
      this.calcEtr();
      log.verb(`Estimated time remaining: ${msToHMS(this.stats.etr)}`);

      // if there are messages to delete, delete them
      if (this.state._messagesToDelete.length > 0) {

        if (!this.state.running || await this.confirm() === false) {
          this.state.running = false; // break out of a job
          this.state._userStopped = true;
          break; // immmediately stop this iteration
        }

        await this.deleteMessagesFromList();

        // A full page does not require one more delayed search when every known
        // result has already been processed.
        if (this.state.grandTotal > 0 && this.state.delCount + this.state.offset >= this.state.grandTotal) {
          this.logEndState('Ended because all known messages were processed.');
          this.state.running = false;
          break;
        }
      }
      else if (this.state._skippedMessages.length > 0) {
        // There are stuff, but nothing to delete (example a page full of system messages)
        // check next page until we see a page with nothing in it (end of results).
        const oldOffset = this.state.offset;
        this.state.offset += this.state._skippedMessages.length;
        log.verb('There\'s nothing we can delete on this page, checking next page...');
        log.verb(`Skipped ${this.state._skippedMessages.length} out of ${this.state._searchResponse.messages.length} in this page.`, `(Offset was ${oldOffset}, adjusted to ${this.state.offset})`);
      }
      else {
        const remaining = Math.max(0, this.state.grandTotal - this.state.delCount - this.state.offset);
        if (remaining > 0 && this.state.emptyPageRetryCount < this.options.emptyPageRetries) {
          this.state.emptyPageRetryCount++;
          log.warn(`Discord returned an empty page while ${remaining} result(s) are still expected. Retrying (${this.state.emptyPageRetryCount}/${this.options.emptyPageRetries})...`);
        } else {
          this.logEndState('Ended because API returned an empty page.');
          this.state.running = false;
          break;
        }
      }

      // wait before next page (fix search page not updating fast enough)
      log.verb(`Waiting ${(this.options.searchDelay / 1000).toFixed(2)}s before next page...`);
      await wait(this.options.searchDelay);

    } while (this.state.running);

    this.stats.endTime = new Date();
    log.success(`Ended at ${this.stats.endTime.toLocaleString()}! Total time: ${msToHMS(this.stats.endTime.getTime() - this.stats.startTime.getTime())}`);
    this.printStats();
    log.debug(`Deleted ${this.state.delCount} messages, ${this.state.failCount} failed.\n`);

    if (!isJob) this.notifyStop();
  }

  stop() {
    this.state.running = false;
    this.state._userStopped = true;
    this.notifyStop();
  }

  logEndState(reason) {
    log.verb(reason);
    log.verb(
      'End state:',
      `iterations=${this.state.iterations}`,
      `total=${this.state.grandTotal}`,
      `deleted=${this.state.delCount}`,
      `failed=${this.state.failCount}`,
      `offset=${this.state.offset}`
    );
  }

  requestSignal(timeoutMs = 30000) {
    try {
      return typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(Math.max(1000, Number(timeoutMs) || 30000))
        : undefined;
    } catch {
      return undefined;
    }
  }

  notifyStop() {
    if (this.state._stopNotified) return;
    this.state._stopNotified = true;
    if (this.onStop) this.onStop(this.state, this.stats);
  }

  /** Calculate the estimated time remaining based on the current stats */
  calcEtr() {
    const remaining = Math.max(0, this.state.grandTotal - this.state.delCount - this.state.failCount);
    this.stats.etr = (this.options.searchDelay * Math.ceil(remaining / 25)) + ((this.options.deleteDelay + (this.stats.avgPing || 0)) * remaining);
  }

  /** Ask for confirmation at the beginning of the process. */
  async confirm() {
    if (!this.options.askForConfirmation) return true;

    log.verb('Waiting for your confirmation...');
    const previewLimit = 10;
    const previewMessages = this.state._messagesToDelete.slice(0, previewLimit);
    const preview = previewMessages
      .map(m => `${m.author.username}${m.author.discriminator && m.author.discriminator !== '0' ? `#${m.author.discriminator}` : ''}: ${Array.isArray(m.attachments) && m.attachments.length ? '[ATTACHMENTS]' : (m.content || '')}`)
      .concat(this.state._messagesToDelete.length > previewLimit
        ? [`... and ${this.state._messagesToDelete.length - previewLimit} more message(s)`]
        : [])
      .join('\n');

    const answer = await ask(
      `Do you want to delete ~${this.state.grandTotal} messages? (Estimated time: ${msToHMS(this.stats.etr)})` +
      '\n(The actual number of messages may be less, depending if you\'re using filters to skip some messages)' +
      '\n\n---- Preview ----\n' +
      preview
    );

    if (!answer) {
      log.error('Aborted by you!');
      return false;
    }
    else {
      log.verb('OK');
      this.options.askForConfirmation = false; // do not ask for confirmation again on the next request
      return true;
    }
  }

  async search() {
    let API_SEARCH_URL;
    if (this.options.guildId === '@me') API_SEARCH_URL = `https://discord.com/api/v9/channels/${this.options.channelId}/messages/`; // DMs
    else API_SEARCH_URL = `https://discord.com/api/v9/guilds/${this.options.guildId}/messages/`; // Server

    let retryCount = 0;
    let requestRetryCount = 0;
    const maxApiRetries = 20;
    const maxRequestRetries = Math.max(0, Number(this.options.searchRequestRetries) || 0);
    const retryRequest = async reason => {
      requestRetryCount++;
      if (requestRetryCount > maxRequestRetries) return false;

      const waitTime = Math.max(1, Number(this.options.searchRetryDelay) || 2000);
      log.warn(`${reason} Retrying in ${waitTime}ms (${requestRetryCount}/${maxRequestRetries})...`);
      await wait(waitTime);
      return this.state.running;
    };
    while (this.state.running) {
      let resp;
      try {
        this.beforeRequest();
        const signal = this.requestSignal(this.options.searchRequestTimeout);
        resp = await fetch(API_SEARCH_URL + 'search?' + queryString([
          ['author_id', this.options.authorId || undefined],
          ['channel_id', (this.options.guildId !== '@me' ? this.options.channelId : undefined) || undefined],
          ['min_id', this.options.minId ? toSnowflake(this.options.minId) : undefined],
          ['max_id', this.options.maxId ? toSnowflake(this.options.maxId) : undefined],
          ['sort_by', 'timestamp'],
          ['sort_order', 'desc'],
          ['offset', this.state.offset],
          ['has', this.options.hasLink ? 'link' : undefined],
          ['has', this.options.hasFile ? 'file' : undefined],
          ['content', this.options.content || undefined],
          ['include_nsfw', this.options.includeNsfw ? true : undefined],
        ]), {
          headers: {
            'Authorization': this.options.authToken,
          },
          ...(signal ? { signal } : {}),
        });
        this.afterRequest();
      } catch (err) {
        this.afterRequest();
        if (!this.state.running) return null;

        const timedOut = err?.name === 'TimeoutError' || err?.name === 'AbortError';
        if (await retryRequest(timedOut ? 'Discord search timed out.' : 'Discord search request failed.')) continue;

        this.state.running = false;
        log.error(`Discord search failed after ${maxRequestRetries} retries.`, err);
        throw err;
      }

      if (!this.state.running) return null;

      if (resp.status === 202 || resp.status === 429) {
        retryCount++;
        const body = await this.readResponseBody(resp);
        const retryAfter = Number(body?.retry_after) * 1000;
        const fallbackDelay = Math.max(100, Number(this.options.searchDelay) || 1000);
        const waitTime = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : fallbackDelay;

        if (resp.status === 202) {
          log.warn(`This channel isn't indexed yet. Waiting ${waitTime}ms for Discord to index it...`);
        } else {
          this.stats.throttledCount++;
          this.stats.throttledTotalTime += waitTime;
          this.options.searchDelay = Math.min(60000, Math.max(fallbackDelay, waitTime));
          log.warn(`Being rate limited by the API for ${waitTime}ms! Search delay is now ${this.options.searchDelay}ms.`);
          this.printStats();
        }

        if (retryCount > maxApiRetries) {
          this.state.running = false;
          throw new Error(`Discord search API did not become ready after ${maxApiRetries} retries.`);
        }

        await wait(waitTime);
        continue;
      }

      if (!resp.ok) {
        const body = await this.readResponseBody(resp);
        const errorCode = Number(body?.code);
        if ([408, 425, 500, 502, 503, 504].includes(resp.status)) {
          if (await retryRequest(`Discord search returned transient status ${resp.status}.`)) continue;

          this.state.running = false;
          const error = new Error(`Discord search kept returning transient status ${resp.status} after ${maxRequestRetries} retries.`);
          error.status = resp.status;
          error.body = body;
          log.error(error.message, body);
          throw error;
        }
        if (resp.status === 403 || (resp.status === 400 && [50001, 50024].includes(errorCode))) {
          log.warn(`Skipping this channel because Discord denied or cannot perform message search (status ${resp.status}${errorCode ? `, code ${errorCode}` : ''}).`);
          const emptyResponse = { total_results: 0, messages: [] };
          this.state._searchResponse = emptyResponse;
          return emptyResponse;
        }
        this.state.running = false;
        const error = new Error(`Discord search API responded with status ${resp.status}.`);
        error.status = resp.status;
        error.body = body;
        log.error(error.message, body);
        throw error;
      }

      const data = await this.readResponseBody(resp);
      if (!data || !Array.isArray(data.messages)) {
        this.state.running = false;
        throw new Error('Discord search API returned an unexpected response.');
      }

      this.state._searchResponse = data;
      console.debug(PREFIX, 'Search page received.', { totalResults: data.total_results, groups: data.messages.length });
      return data;
    }

    return null;
  }

  async filterResponse() {
    const data = this.state._searchResponse;

    // the search total will decrease as we delete stuff
    const total = data.total_results;
    if (total > this.state.grandTotal) this.state.grandTotal = total;

    // search returns messages near the the actual message, only get the messages we searched for.
    const discoveredMessages = data.messages
      .map(convo => Array.isArray(convo) ? convo.find(message => message?.hit === true) : null)
      .filter(Boolean);

    // we can only delete some types of messages, system messages are not deletable.
    let messagesToDelete = discoveredMessages;
    const deletableTypes = new Set([0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 46]);
    messagesToDelete = messagesToDelete.filter(msg => deletableTypes.has(msg.type));
    messagesToDelete = messagesToDelete.filter(msg => msg.pinned ? this.options.includePinned : true);

    // custom filter of messages
    if (this.options.pattern) {
      try {
        const regex = new RegExp(this.options.pattern, 'i');
        messagesToDelete = messagesToDelete.filter(msg => regex.test(msg.content));
      } catch (err) {
        log.error('The RegExp pattern is malformed. No messages will be deleted.', err);
        messagesToDelete = [];
      }
    }

    // create an array containing everything we skipped. (used to calculate offset for next searches)
    const skippedMessages = discoveredMessages.filter(msg => !messagesToDelete.find(m => m.id === msg.id));

    this.state._messagesToDelete = messagesToDelete;
    this.state._skippedMessages = skippedMessages;

    console.debug(PREFIX, 'Search page filtered.', {
      deletable: messagesToDelete.length,
      skipped: skippedMessages.length,
    });
  }

  async deleteMessagesFromList() {
    for (let i = 0; i < this.state._messagesToDelete.length; i++) {
      const message = this.state._messagesToDelete[i];
      if (!this.state.running) return log.error('Stopped by you!');

      const authorName = message.author.discriminator && message.author.discriminator !== '0'
        ? `${message.author.username}#${message.author.discriminator}`
        : message.author.username;
      const attachments = Array.isArray(message.attachments) ? message.attachments : [];
      const attachmentSummary = attachments.length
        ? ` [${attachments.length} attachment${attachments.length === 1 ? '' : 's'}: ${attachments.map(file => file.filename || file.id || 'unnamed').join(', ')}]`
        : '';

      log.debug(
        // `${((this.state.delCount + 1) / this.state.grandTotal * 100).toFixed(2)}%`,
        `[${this.state.delCount + this.state.failCount + 1} of ${this.state.grandTotal}] ` +
        `<sup>${new Date(message.timestamp).toLocaleString()}</sup> ` +
        `<b>${redact(authorName)}</b>` +
        `: <i>${redact(message.content).replace(/\n/g, '↵')}</i>` +
        (attachmentSummary ? redact(attachmentSummary) : ''),
        `<sup>{ID:${redact(message.id)}}</sup>`
      );

      // Delete a single message (with retry)
      let result = 'FAILED';
      for (let attempt = 1; attempt <= this.options.maxAttempt; attempt++) {
        if (!this.state.running) return log.error('Stopped by you!');
        result = await this.deleteMessage(message);
        if (result !== 'RETRY') break;
        if (attempt < this.options.maxAttempt) {
          log.verb(`Retrying in ${this.options.deleteDelay}ms... (${attempt}/${this.options.maxAttempt})`);
          await wait(this.options.deleteDelay);
        }
      }

      if (result !== 'OK') {
        this.state.failCount++;
        // Do not immediately rediscover and retry the same terminal failure forever.
        this.state.offset++;
      }

      this.calcEtr();
      if (this.onProgress) this.onProgress(this.state, this.stats);

      if (this.state.running && i < this.state._messagesToDelete.length - 1) {
        await wait(this.options.deleteDelay);
      }
    }
  }

  async deleteMessage(message) {
    const API_DELETE_URL = `https://discord.com/api/v9/channels/${message.channel_id}/messages/${message.id}`;
    let resp;
    try {
      this.beforeRequest();
      const signal = this.requestSignal();
      resp = await fetch(API_DELETE_URL, {
        method: 'DELETE',
        headers: {
          'Authorization': this.options.authToken,
        },
        ...(signal ? { signal } : {}),
      });
      this.afterRequest();
    } catch (err) {
      // no response error (e.g. network error)
      log.error('Delete request threw an error:', err);
      log.verb('Related object:', redact(JSON.stringify(message)));
      return 'RETRY';
    }

    if (!resp.ok) {
      if (resp.status === 429) {
        // deleting messages too fast
        const body = await this.readResponseBody(resp);
        const retryAfter = Number(body?.retry_after) * 1000;
        const w = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter
          : Math.max(100, Number(this.options.deleteDelay) || 1000);
        this.stats.throttledCount++;
        this.stats.throttledTotalTime += w;
        this.options.deleteDelay = Math.min(60000, Math.max(Number(this.options.deleteDelay) || 0, w));
        log.warn(`Being rate limited by the API for ${w}ms! Adjusted delete delay to ${this.options.deleteDelay}ms.`);
        this.printStats();
        log.verb(`Cooling down for ${w}ms before retrying...`);
        return 'RETRY';
      } else {
        if (resp.status === 403) {
          const body = await this.readResponseBody(resp);
          log.warn('Discord denied permission to delete this message. It will be skipped.', body);
          return 'FAIL_SKIP';
        }
        const body = await resp.text();

        try {
          const r = JSON.parse(body);

          if (resp.status === 400 && r.code === 50083) {
            // 400 can happen if the thread is archived (code=50083)
            // in this case we need to "skip" this message from the next search
            // otherwise it will come up again in the next page (and fail to delete again)
            log.warn('Error deleting message (Thread is archived). It will be skipped on the next search page.');
            return 'FAIL_SKIP'; // Failed but we will skip it next time
          }

          log.error(`Error deleting message, API responded with status ${resp.status}!`, r);
          log.verb('Related object:', redact(JSON.stringify(message)));
          return resp.status >= 500 ? 'RETRY' : 'FAILED';
        } catch {
          log.error(`Fail to parse JSON. API responded with status ${resp.status}!`, body);
          log.verb('Related object:', redact(JSON.stringify(message)));
          return resp.status >= 500 ? 'RETRY' : 'FAILED';
        }
      }
    }

    this.state.delCount++;
    return 'OK';
  }

  async readResponseBody(resp) {
    const text = await resp.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  #beforeTs = 0; // used to calculate latency
  beforeRequest() {
    this.#beforeTs = Date.now();
  }
  afterRequest() {
    this.stats.lastPing = (Date.now() - this.#beforeTs);
    this.stats.avgPing = this.stats.avgPing > 0 ? (this.stats.avgPing * 0.9) + (this.stats.lastPing * 0.1) : this.stats.lastPing;
  }

  printStats() {
    log.verb(
      `Delete delay: ${this.options.deleteDelay}ms, Search delay: ${this.options.searchDelay}ms`,
      `Last Ping: ${this.stats.lastPing}ms, Average Ping: ${this.stats.avgPing | 0}ms`,
    );
    log.verb(
      `Rate Limited: ${this.stats.throttledCount} times.`,
      `Total time throttled: ${msToHMS(this.stats.throttledTotalTime)}.`
    );
  }
}

export default UndiscordCore;
