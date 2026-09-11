# Undiscord - Delete all messages in a Discord channel or DM
<!-- shields -->
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/victornpb/undiscord?color=%235865f2&display_name=tag&label=Undiscord&style=flat-square)][greasyfork_url]
[![GitHub Release Date](https://img.shields.io/github/release-date/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/releases)
[![GitHub License](https://img.shields.io/github/license/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/blob/master/LICENSE)
[![CodeFactor](https://www.codefactor.io/repository/github/victornpb/undiscord/badge?style=flat-square)](https://www.codefactor.io/repository/github/victornpb/undiscord?style=flat-square)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/victornpb/undiscord?style=flat-square)
[![GitHub Stars](https://img.shields.io/github/stars/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/network/members)
[![GitHub Discussions](https://img.shields.io/github/discussions/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/discussions)
[![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/victornpb/undiscord?style=flat-square&color=green)](https://github.com/victornpb/undiscord/pulls?q=is%3Apr+is%3Aclosed)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/victornpb/undiscord?style=flat-square&color=green)](https://github.com/victornpb/undiscord/issues?q=is%3Aissue+is%3Aclosed)
<!-- end shields -->

> ⚠️ **Any tool that automates actions on user accounts, including this one, could result in account termination.** (see [self-bots][self-bots]).  
> Use at your own risk! ([discussion](https://github.com/victornpb/undiscord/discussions/273)).

## At a glance

This is an unofficial maintenance fork of Undiscord 5.2.6 for the current Discord web interface. It fixes the launcher and UI compatibility, improves message deletion reliability, and cleans up a number of filtering, logging, retry, and error-handling problems.

The fork identifies itself as `5.2.6-Void-fix` so it is clear that it is based on upstream 5.2.6 and is not an official Undiscord 5.3 release.

- [Install 5.2.6-Void-fix](https://raw.githubusercontent.com/Void-Man-1/undiscord-UI-fix/master/deleteDiscordMessages.user.js)
- [Read the full fix list](./FIXES-5.2.6-Void-fix.md)

## Description

### Fixed fork — 5.2.6-Void-fix

This is an unofficial maintenance fork of Undiscord 5.2.6, updated for Discord's current web interface. The version name deliberately keeps `5.2.6` in it so it is clear that this is based on the upstream 5.2.6 release and is not an official Undiscord 5.3 release.

The main problem was the launcher. Upstream Undiscord inserted its trash button directly into Discord's own toolbar. That depended on Discord's internal DOM structure staying roughly the same. Once Discord changed the header, the button could disappear, move native controls, leave an empty gap, or end up in the wrong place.

This fork changes that approach. The launcher is now owned entirely by Undiscord and is attached to `document.body` as a fixed overlay. It still reads the position of Discord's header controls so it can line up with them visually, but it does not move, reparent, resize, hide, or restyle Discord's own toolbar elements.

That keeps the button in a predictable place across DMs, group DMs, and server channels while reducing the chance that a Discord layout change will break the rest of the header.

The launcher also waits until a real channel view is present before appearing, repositions itself when Discord changes routes or resizes the page, and hides while the Undiscord panel is open so it does not overlap the panel.

### UI and UX changes

The interface was also cleaned up for the current Discord layout rather than simply patching one broken selector.

- The launcher is now a real HTML button instead of a clickable `div`, which gives it proper keyboard and accessibility behavior.
- The old misspelled launcher ID was fixed.
- Undiscord now uses its own fallback colors and layout values when Discord changes or removes internal CSS variables.
- The panel, sidebar, toolbar controls, inputs, sliders, resize handles, hover states, and focus states were adjusted so they remain usable on current Discord.
- The panel scales down more sensibly on smaller browser windows instead of letting controls spill outside the layout.
- Message picking no longer starts with a blocking browser alert. A small in-page prompt is shown instead, and Escape cancels the picker cleanly.
- Streamer-mode warnings are shown inside the interface instead of through browser popups.
- Duplicate initialization is prevented so route changes do not create multiple Undiscord launchers.

### Search and deletion reliability

The deletion code also had a few cases where temporary Discord API behavior could make a run stop too early or retry forever.

The search loop now uses bounded retries instead of recursively calling itself. It handles request timeouts, temporary network failures, Discord 5xx responses, rate limits, channels that are still being indexed, and temporarily empty search pages without turning those cases into an endless retry loop.

If Discord refuses access to a channel or cannot search it, that channel is skipped cleanly instead of leaving the batch stuck there.

Deletion failures are handled more carefully as well. Messages that cannot be deleted are counted and moved past instead of being rediscovered over and over. Retry timing and rate-limit handling were tightened up, and the displayed progress, failure count, and estimated time remaining were corrected.

### Filtering, IDs, dates, and logs

A few smaller bugs could also affect what Undiscord selected or showed:

- supported Discord message types are handled more accurately;
- deletable poll messages are supported;
- unsupported application-command messages are excluded;
- an invalid regular expression now fails closed instead of accidentally widening the deletion set;
- Discord snowflake conversion for date filters uses exact integer arithmetic;
- invalid date ranges and imported channel IDs are checked before deletion starts;
- token and current-user detection no longer fires a fake `beforeunload` event or leaves temporary iframes behind;
- external message content is escaped before being written to the Undiscord log;
- large API responses and attachment objects are summarized instead of being dumped into the visible log;
- progress output is easier to read and keeps failed messages separate from successful deletions.

### Build and tests

The development setup was updated for current Node.js tooling, including Rollup and ESLint. The fork also adds 25 automated unit and DOM tests covering the main areas changed here: API retries, pagination, filtering, launcher placement, preservation of Discord's native toolbar, panel behavior, helper functions, and message picking.

The built userscript was also checked against current DM and server-channel layouts in Brave.

- [Install 5.2.6-Void-fix](https://raw.githubusercontent.com/Void-Man-1/undiscord-UI-fix/master/deleteDiscordMessages.user.js)
- [Read the full fix list](./FIXES-5.2.6-Void-fix.md)

## For nerds

### Launcher / DOM integration

The launcher no longer gets appended to Discord's React-owned toolbar. It is mounted under `document.body` as an Undiscord-owned `position: fixed` overlay. Discord's DOM is used only as a geometry source.

Relevant implementation details:

- route detection uses `^/channels/(?:@me|\d+)/\d+/?$`;
- the channel header is located through `[aria-label="Channel header"]` plus toolbar/action fallbacks;
- a real loaded channel is confirmed using selectors such as `[data-list-id="chat-messages"]`, `[class*="messagesWrapper"]`, and `[role="textbox"]`;
- `getBoundingClientRect()` is used to place the overlay next to the last stable native toolbar action;
- launcher mount delay is 400 ms and the native-control gap is 22 px;
- DOM mutations are throttled to 250 ms instead of remounting immediately on every React mutation;
- resize events recalculate the overlay position;
- duplicate initialization is rejected if `#undiscord` or `#undiscord-btn` already exists;
- the launcher is hidden while the Undiscord panel is open and `aria-expanded` tracks panel state.

Because the launcher is outside the native toolbar, Discord controls are never reparented, resized, hidden, or restyled by the fork.

### Search state machine and API recovery

Search retries were changed from recursive re-entry to bounded iterative retry logic. The current defaults are:

```text
jobDelay:              1000 ms
emptyPageRetries:      2
searchRequestTimeout:  60000 ms
searchRequestRetries:  3
searchRetryDelay:      2000 ms
```

The request path uses `AbortSignal.timeout()` for hard request timeouts. HTTP 202 and 429 responses are retried with Discord's `retry_after` value when available, with a bounded fallback rather than unbounded recursion.

Transient HTTP statuses handled as retryable include:

```text
408  Request Timeout
425  Too Early
500  Internal Server Error
502  Bad Gateway
503  Service Unavailable
504  Gateway Timeout
```

A 403, Discord error `50001` (Missing Access), or `50024` is treated as a channel that cannot be searched and is skipped cleanly. Empty search pages can also be retried when Discord reports that more results should still exist.

Unexpected or malformed API responses fail through a controlled error path instead of silently poisoning pagination state.

### Deletion behavior

Deletion retries are bounded as well. A terminally undeletable message increments the failure count and advances the offset, which prevents the same message from being rediscovered indefinitely by the next search page.

Discord error `50083` for archived threads is treated as a skip condition. Temporary 5xx failures are retryable, and invalid or missing rate-limit values fall back to bounded delays. Delete delay growth is capped rather than increasing forever.

Progress accounting now separates successful deletions from failed ones, and ETR is calculated from the remaining work rather than the original total:

```text
remaining = grandTotal - delCount - failCount
```

### Filtering and Discord message types

The fork uses an explicit set of deletable Discord message types instead of assuming every search hit is safe to delete:

```text
0, 6, 7, 8, 9, 10, 11, 12, 13, 14,
15, 16, 17, 18, 19, 46
```

Type `46` poll messages are supported. Type `20` application-command messages are deliberately excluded.

Regular-expression filters now fail closed: an invalid pattern produces an error and an empty deletion set instead of dropping the regex filter and potentially matching more messages than the user intended.

### Snowflakes, IDs, and Discord internals

Date filtering converts Discord snowflakes using `BigInt`, avoiding precision loss from JavaScript `Number` when working with 64-bit IDs.

Token and current-user lookup was also changed. The old code triggered a fake `beforeunload` event and could leave a temporary iframe behind. The fork reads local storage through a hidden iframe and removes it in `finally`, then falls back to Discord's webpack module cache when necessary.

Webpack lookup injects a temporary chunk to capture the runtime `require`, removes that temporary chunk afterward, and defensively scans the module cache for methods such as `getToken` and `getCurrentUser`.

### Message picker lifecycle

The old picker modified Discord's chat surface and depended mainly on click behavior. The current picker installs capture listeners only while a pick operation is active.

It supports:

- click capture;
- Escape cancellation;
- a 30-second timeout;
- deterministic listener/timer cleanup;
- current Discord message node patterns such as `[id^="message-content-"]` and `[id^="chat-messages-"]`.

The prompt is rendered by Undiscord instead of rewriting Discord's message hover UI.

### Logging and UI safety

External message content is HTML-escaped before being inserted into the visible log. The UI logger also:

- limits retained log entries to 5,000;
- serializes `Error` objects explicitly;
- handles circular objects;
- restricts log type names to a known set;
- bounds large diagnostic blocks so API payloads cannot expand the panel indefinitely;
- summarizes attachments and large Discord responses rather than dumping raw objects.

### Build and verification

The fork uses current Rollup configuration and ESLint flat config instead of the old `.eslintrc` setup. The generated userscript is built from the source tree, and the repository includes 25 automated core/DOM tests covering:

- API retry and failure behavior;
- search pagination;
- filtering;
- launcher placement;
- preservation of native Discord toolbar nodes;
- panel lifecycle;
- message picking;
- helper functions.

The generated userscript and package metadata use the fork version `5.2.6-Void-fix` so the repository does not present the fork as an upstream `5.3.x` release.

## Original description

(Due to changes in chrome manifest V3, [Brave browser][brave_browser] is recommended)

1. First you need a Browser Extension for managing UserScripts[[1]][userscrips_faq] (skip if you already have one):
   * Brave: [Violentmonkey][chrome_violentmonkey] or [Tampermonkey][chrome_tampermonkey]
   * Chrome: [Violentmonkey][chrome_violentmonkey] or [Tampermonkey][chrome_tampermonkey]
   * Firefox: [Greasemonkey][firefox_greasemonkey], [Tampermonkey][firefox_tampermonkey], or [Violentmonkey][firefox_violentmonkey]  
   * Opera: [Tampermonkey][opera_tampermonkey] or [Violentmonkey][opera_violentmonkey]
   * Edge: [Tampermonkey][edge_tampermonkey]  
   * Safari: ~[Tampermonkey][safari_tampermonkey]~ 
    
1. Install Undiscord:  
  [![][greasyfork_icon]][greasyfork_url] or [![][openuserjs_icon]][openuserjs_url]  
  (NOTE: GreasyFork is recommended for now, OpenUserJS is not receiving updates)

1. Open <a href="https://discord.com/channels/@me" target="_blank">Discord</a> in your __browser__ (Not the App) and go to the channel or direct message you would like to be wiped.

1. Click the <kbd>🗑️</kbd> button that was added in the top right corner.

1. Click on the buttons near **Author ID** and **Server ID** and **Channel ID**.  

1. Click the ![Delete](https://user-images.githubusercontent.com/3372598/223744853-c0d4d9e3-1914-486b-bb4f-f27e40d0e3e7.png) button to begin wipping! 


![Screenshot](https://user-images.githubusercontent.com/3372598/222977831-88eeb59a-186a-4947-8e33-0ac245c3af5c.gif)

I made this tool just for you ❤️ , it would be awesome if you could just click the [⭐️ Star button](https://github.com/victornpb/undiscord) at the top!

> A few extra generous people asked for this, so here you can [buy me a coffee](https://www.buymeacoffee.com/vitim). Thank you! You'll be in my special list ^_^

----
### Need help?
Check out the [wiki](https://github.com/victornpb/undiscord/wiki) for helpful articles, or read existing [questions](https://github.com/victornpb/undiscord/discussions), or post a new one.

### Have an Idea or Feature request?
Check out the [Ideas][ideas] section, if your idea _hasn't been posted before_, please post a new one.

### Found a bug?
Is prefered that _issues_ follow a certain format. If you're not familiar with bug reports, please use the [discussions][discussions] tab instead.

If you believe you found a bug please file an [issue](https://github.com/victornpb/undiscord/issues), but please fill the issue template.

If you are looking to contribute please read the [CONTRIBUTING](./CONTRIBUTING.md) first.

### Copy paste version
Looking for the old Copy/Paste version? [here](https://github.com/victornpb/undiscord/wiki/Copy-paste-method)


----

Originally from https://gist.github.com/victornpb/135f5b346dea4decfc8f63ad7d9cc182

----
## ⛔️ DO NOT SHARE YOUR AUTH TOKEN! ⛔️ ##

Sharing your authToken on the internet will give full access to your account! [There are bots gathering credentials all over the internet](https://github.com/rndinfosecguy/Scavenger).
If you post your token by accident, LOGOUT from discord on that **same browser** you got that token imediately.
Changing your password will make sure you get logged out of every device. I advice that you turn on [2FA](https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication) afterwards.

If you are unsure do not post screenshots, or logs on the internet.

----
## Security Concerns

Using third-party scripts means you trust that the script’s developer hasn’t inserted malicious functionality into the code and has secured it against attackers trying to do the same. You should never run code you don't trust.

Please read: [what I'm doing to ensure this is safe for users][security_policy].

----
#### DISCLAIMER

> THE SOFTWARE AND ALL INFORMATION HERE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
>
> By using any code or information provided here you are agreeing to all parts of the above Disclaimer.




<!-- links -->
  [self-bots]: https://support.discordapp.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-
  [userscrips_faq]: https://en.wikipedia.org/wiki/Userscript
  [greasyfork_icon]: https://user-images.githubusercontent.com/3372598/166113712-1bc3d654-1342-4f1e-9845-21c3b21524b1.png
  [openuserjs_icon]: https://user-images.githubusercontent.com/3372598/166113714-5a2ede39-8d66-43a8-b5da-8f1897cb3121.png
  [greasyfork_moderation]: https://greasyfork.org/en/moderator_actions

  [issues]: https://github.com/victornpb/undiscord/issues
  [issues_open]: https://github.com/victornpb/undiscord/issues
  [issues_closed]: https://github.com/victornpb/undiscord/issues
  [prs]: https://github.com/victornpb/undiscord/pulls
  [pr_open]: https://github.com/victornpb/undiscord/pulls
  [prs_closed]: https://github.com/victornpb/undiscord/pulls
  [forks]: https://github.com/victornpb/undiscord/network/members

  [wiki]: https://github.com/victornpb/undiscord/wiki
  [discussions]: https://github.com/victornpb/undiscord/discussions
  [ideas]: https://github.com/victornpb/undiscord/discussions/categories/2-ideas
  [questions]: https://github.com/victornpb/undiscord/discussions/categories/1-questions-answers
  [security_policy]: https://github.com/victornpb/undiscord/wiki/Security-Policy

<!-- Extensions -->
  [chrome_violentmonkey]: https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag
  [chrome_tampermonkey]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
  [firefox_greasemonkey]: https://addons.mozilla.org/firefox/addon/greasemonkey/
  [firefox_tampermonkey]: https://addons.mozilla.org/firefox/addon/tampermonkey/
  [firefox_violentmonkey]: https://addons.mozilla.org/firefox/addon/violentmonkey/
  [safari_tampermonkey]: https://github.com/victornpb/undiscord/issues/91#issuecomment-654514364
  [edge_tampermonkey]: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
  [opera_tampermonkey]: https://addons.opera.com/extensions/details/tampermonkey-beta/
  [opera_violentmonkey]: https://addons.opera.com/extensions/details/violent-monkey/

<!-- Download links -->
  [greasyfork_url]: <https://greasyfork.org/en/scripts/406540-undiscord-delete-all-messages-in-a-discord-channel-or-dm-bulk-deletion> "Get Undiscord from GreasyFork"
  [openuserjs_url]: <https://openuserjs.org/scripts/victornpb/Undiscord_-_Delete_all_messages_in_a_Discord_channel_or_DM_(Bulk_deletion)> "Get Undiscord from OpenUserJS"

  [brave_browser]: https://brave.com/download/
