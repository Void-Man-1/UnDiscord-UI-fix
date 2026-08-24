# Undiscord fixed fork 5.3.7

This build updates Undiscord 5.2.6 for Discord's current web interface. It retains the original project's MIT license and attribution.

## Discord UI compatibility

- Restored the trash launcher on current Discord channel headers.
- Kept the launcher in the same visual position in DMs, group DMs, and server channels.
- Rendered the launcher outside Discord's toolbar so no native Discord element is moved, reparented, resized, hidden, or restyled.
- Added an Undiscord-owned white separator between the launcher and Discord's native actions.
- Removed the dead toolbar slot that appeared in server channels without call controls.
- Delayed launcher mounting until a real channel surface is present, avoiding flashes over Discord's loading shell.
- Repositions the launcher after route, toolbar, and window-size changes.
- Keeps the launcher white and hides it while the Undiscord panel is open, preventing header overlap.

## Panel and control repairs

- Repaired the misspelled launcher ID and replaced the faux button with an accessible native button.
- Added current Discord color fallbacks so the panel remains legible when Discord renames CSS variables.
- Fixed toolbar wrapping, sidebar sizing, responsive layout, resize handles, inputs, range controls, hover states, and focus indicators.
- Added accessible labels and button semantics to the dialog and controls.
- Replaced blocking picker and streamer-mode alerts with in-page status messages.
- Added Escape cancellation and automatic cleanup to message picking.
- Prevented duplicate initialization and duplicate launcher instances.

## Search and deletion reliability

- Replaced recursive search retries with bounded iterative retries.
- Added request timeouts and retries for timeouts, network errors, HTTP 408/425, and transient 5xx responses.
- Added bounded handling for HTTP 202 and 429 responses, including safer `retry_after` parsing.
- Retries empty result pages before deciding that Discord has no more messages to load.
- Skips channels cleanly on Discord permission and unavailable-channel responses instead of looping forever.
- Corrected the cached search-response field typo and hardened malformed response handling.
- Added deletable poll messages (type 46) while excluding undeletable application-command messages (type 20).
- Prevented malformed regular expressions from silently widening the deletion set.
- Prevented terminal delete failures from being rediscovered indefinitely.
- Fixed failure counting, displayed progress numbering, retry accounting, and remaining-time calculations.
- Avoided unnecessary waits after completion or after the final message in a page.

## IDs, dates, logs, and safety

- Updated Discord token and current-user discovery without dispatching a fake `beforeunload` event or leaking temporary iframes.
- Added exact BigInt Discord snowflake conversion for date filters and validation for invalid date ranges.
- Escaped all external log content, including `>`, to prevent message content from injecting markup into the panel.
- Stopped dumping full Discord API response payloads and attachment objects into the visible log.
- Replaced ambiguous `[N/total]` output and raw `?` attachment content with readable progress and attachment summaries.
- Preserved zero, false, and empty-string interpolation values instead of treating them as missing.
- Added bounded, readable rendering for diagnostic objects and safer error messages.

## Build and verification

- Modernized Rollup and ESLint development tooling for the current Node.js runtime.
- Fixed safe embedding of HTML/CSS strings and normalized Windows line endings during builds.
- Added 25 automated unit and DOM integration tests covering helpers, API retries, pagination, filtering, launcher placement, native toolbar preservation, panel lifecycle, and message picking.
- Verified the installable userscript in Brave against live Discord DM and server channel layouts.

## Install

Install [`deleteDiscordMessages.user.js`](https://raw.githubusercontent.com/Void-Man-1/undiscord/master/deleteDiscordMessages.user.js) with Tampermonkey or Violentmonkey.

As with upstream Undiscord, automating a Discord user account can violate Discord rules and may result in account action. Use it only after reviewing the source and at your own risk.
