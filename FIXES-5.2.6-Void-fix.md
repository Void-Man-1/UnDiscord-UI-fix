# Undiscord 5.2.6-Void-fix

This is an unofficial maintenance build based on upstream Undiscord 5.2.6. The version name keeps the upstream base version visible so it is not mistaken for an official new Undiscord release.

## Discord UI compatibility

- Restored the trash launcher on current Discord channel headers.
- Kept the launcher in the same visual position in DMs, group DMs, and server channels.
- Moved the launcher out of Discord's native toolbar and into an Undiscord-owned fixed overlay attached to `document.body`.
- The launcher still reads Discord's toolbar geometry for positioning, but no native Discord element is moved, reparented, resized, hidden, or restyled.
- Added an Undiscord-owned separator instead of modifying Discord's own toolbar styling.
- Removed the dead toolbar slot that could appear in server channels without call controls.
- Delayed launcher mounting until a real channel view is present so it does not flash over Discord's loading shell.
- Repositions the launcher after route, toolbar, and window-size changes.
- Hides the launcher while the Undiscord panel is open so the two do not overlap.

## Panel and control fixes

- Fixed the misspelled launcher ID and replaced the clickable `div` with a real HTML button.
- Added fallback colors for Discord CSS variables that have changed or disappeared.
- Fixed toolbar wrapping, sidebar sizing, responsive layout, resize handles, inputs, sliders, hover states, and keyboard focus indicators.
- Added clearer labels and button semantics to the dialog and controls.
- Replaced blocking message-picker and streamer-mode alerts with in-page status messages.
- Added Escape cancellation and automatic cleanup to message picking.
- Prevented duplicate initialization and duplicate launcher instances.

## Search and deletion reliability

- Replaced recursive search retries with bounded iterative retries.
- Added request timeouts and retries for network failures, HTTP 408/425 responses, and temporary 5xx errors.
- Added bounded handling for HTTP 202 and 429 responses, including safer `retry_after` parsing.
- Retries temporarily empty result pages when Discord still reports that messages remain.
- Skips channels cleanly when Discord denies access or cannot perform message search.
- Fixed the cached search-response field typo and hardened malformed response handling.
- Added deletable poll messages (type 46) while excluding application-command messages (type 20).
- Invalid regular expressions now fail closed instead of accidentally widening the deletion set.
- Terminal deletion failures are counted and moved past instead of being rediscovered indefinitely.
- Fixed failure counts, progress numbering, retry accounting, and remaining-time calculations.
- Avoided unnecessary waits after the final message or once all known results have been processed.

## IDs, dates, logs, and safety

- Updated Discord token and current-user discovery without dispatching a fake `beforeunload` event or leaving temporary iframes behind.
- Added exact BigInt Discord snowflake conversion for date filters and validation for invalid date ranges.
- Validates imported channel IDs before starting a deletion run.
- Escapes external log content, including `>`, before displaying it in the panel.
- Stops dumping full Discord API responses and attachment objects into the visible log.
- Replaced ambiguous progress output and raw attachment objects with readable summaries.
- Preserves zero, false, and empty-string interpolation values instead of treating them as missing.
- Added bounded rendering for diagnostic objects and clearer error messages.

## Build and verification

- Updated Rollup and ESLint configuration for current Node.js tooling.
- Fixed safe embedding of HTML/CSS strings and normalized Windows line endings during builds.
- Added 25 automated unit and DOM integration tests covering helpers, API retries, pagination, filtering, launcher placement, native toolbar preservation, panel lifecycle, and message picking.
- Checked the installable userscript against current Discord DM and server-channel layouts in Brave.

## Install

Install [`deleteDiscordMessages.user.js`](https://raw.githubusercontent.com/Void-Man-1/undiscord-UI-fix/master/deleteDiscordMessages.user.js) with Tampermonkey or Violentmonkey.

As with upstream Undiscord, automating a Discord user account can violate Discord rules and may result in account action. Review the source before using it and use it at your own risk.
