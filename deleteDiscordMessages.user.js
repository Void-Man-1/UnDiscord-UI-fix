// ==UserScript==
// @name            Undiscord
// @description     Delete all messages in a Discord channel or DM (Bulk deletion)
// @version         5.3.7
// @author          victornpb
// @homepageURL     https://github.com/victornpb/undiscord
// @supportURL      https://github.com/victornpb/undiscord/discussions
// @match           https://*.discord.com/app
// @match           https://*.discord.com/channels/*
// @match           https://*.discord.com/login
// @license         MIT
// @namespace       https://github.com/victornpb/deleteDiscordMessages
// @icon            https://victornpb.github.io/undiscord/images/icon128.png
// @downloadURL     https://raw.githubusercontent.com/Void-Man-1/undiscord/master/deleteDiscordMessages.user.js
// @updateURL       https://raw.githubusercontent.com/Void-Man-1/undiscord/master/deleteDiscordMessages.user.js
// @contributionURL https://www.buymeacoffee.com/vitim
// @run-at          document-idle
// @grant           none
// @attribution     Original project (https://github.com/victornpb/undiscord)
// ==/UserScript==
(function () {
	'use strict';

	/* rollup-plugin-baked-env */
	const VERSION = "5.3.7";

	var themeCss = "/* undiscord window */\n#undiscord { --ud-surface: #202225; --ud-surface-raised: #2b2d31; --ud-surface-sunken: #17181c; --ud-input-bg: #111214; --ud-input-border: rgba(255, 255, 255, .16); --ud-input-border-focus: #00a8fc; --ud-button-bg: #4e5058; --ud-button-hover: #5d6069; --ud-danger: #da373c; --ud-danger-hover: #a12828; --ud-positive: #248046; --ud-positive-hover: #1a6334; }\n#undiscord.browser { box-shadow: var(--shadow-border), var(--shadow-high); border: 1px solid var(--border-subtle, rgba(255, 255, 255, .12)); overflow: hidden; }\n#undiscord.container,\n#undiscord .container { background-color: var(--background-surface-high, #2b2d31); border-radius: 8px; box-sizing: border-box; cursor: default; flex-direction: column; }\n#undiscord .header { background-color: var(--background-tertiary, #1e1f22); height: 48px; align-items: center; min-height: 48px; padding: 0 16px; display: flex; color: var(--header-secondary); cursor: grab; }\n#undiscord .header .icon { color: var(--interactive-normal); margin-right: 8px; flex-shrink: 0; width: 24px; height: 24px; }\n#undiscord .header .icon:hover { color: var(--interactive-hover); }\n#undiscord .header button.icon { width: 32px; min-width: 32px; height: 32px; min-height: 32px; margin: 0; padding: 4px; background: transparent; }\n#undiscord .header h3 { font-size: 16px; line-height: 20px; font-weight: 500; font-family: var(--font-display); color: var(--header-primary); flex-shrink: 0; margin-right: 16px; }\n#undiscord .spacer { flex-grow: 1; }\n#undiscord .header .vert-divider { width: 1px; height: 24px; background-color: var(--background-modifier-accent); margin-right: 16px; flex-shrink: 0; }\n#undiscord legend,\n#undiscord label { color: var(--header-secondary); font-size: 12px; line-height: 16px; font-weight: 500; text-transform: uppercase; cursor: default; font-family: var(--font-display); margin-bottom: 8px; }\n#undiscord .multiInput { display: flex; align-items: center; font-size: 16px; box-sizing: border-box; width: 100%; gap: 6px; border-radius: 8px; color: var(--text-default, var(--text-normal, #dbdee1)); background: transparent; border: 0; transition: border-color 0.2s ease-in-out 0s; }\n#undiscord .multiInput :first-child { flex-grow: 1; }\n#undiscord .multiInput button:last-child { margin-right: 0; }\n#undiscord .input { font-size: 16px; width: 100%; transition: border-color 0.2s ease-in-out 0s; padding: 10px; height: 44px; background-color: var(--ud-input-bg); border: 1px solid var(--ud-input-border); border-radius: 8px; box-sizing: border-box; color: var(--text-default, var(--text-normal, #dbdee1)); }\n#undiscord fieldset { margin-top: 16px; }\n#undiscord .input-wrapper { display: flex; align-items: center; font-size: 16px; box-sizing: border-box; width: 100%; border-radius: 8px; color: var(--text-default, var(--text-normal, #dbdee1)); background-color: var(--ud-input-bg); border: 1px solid var(--ud-input-border); transition: border-color 0.2s ease-in-out 0s; }\n#undiscord input[type=\"text\"],\n#undiscord input[type=\"search\"],\n#undiscord input[type=\"password\"],\n#undiscord input[type=\"datetime-local\"],\n#undiscord input[type=\"number\"] { background-color: var(--ud-input-bg); border: 1px solid var(--ud-input-border); border-radius: 8px; box-sizing: border-box; color: var(--text-default, var(--text-normal, #dbdee1)); font-size: 16px; height: 44px; padding: 12px 10px; transition: border-color .2s ease-in-out; width: 100%; }\n#undiscord .input-wrapper > input { background: transparent; border: 0; outline: 0; }\n#undiscord input::placeholder { color: var(--text-muted, #949ba4); opacity: 1; }\n#undiscord input[type=\"range\"] { width: 100%; height: 20px; margin: 8px 0; padding: 0; border: 0; accent-color: var(--brand-500, #5865f2); }\n#undiscord input[type=\"checkbox\"] { accent-color: var(--brand-500, #5865f2); }\n#undiscord input[type=\"file\"] { width: 100%; color: var(--text-muted, #b5bac1); font-size: 13px; }\n#undiscord input[type=\"file\"]::file-selector-button { margin-right: 8px; padding: 7px 10px; border: 0; border-radius: 4px; color: #fff; background: var(--ud-button-bg); cursor: pointer; }\n#undiscord .divider,\n#undiscord hr { border: none; margin-bottom: 24px; padding-bottom: 4px; border-bottom: 1px solid var(--background-modifier-accent); }\n#undiscord .sectionDescription { margin-bottom: 16px; color: var(--header-secondary); font-size: 14px; line-height: 20px; font-weight: 400; }\n#undiscord a { color: var(--text-link); text-decoration: none; }\n#undiscord .btn,\n#undiscord button { position: relative; display: flex; -webkit-box-pack: center; justify-content: center; -webkit-box-align: center; align-items: center; box-sizing: border-box; background: none; border: none; border-radius: 3px; font-size: 14px; font-weight: 500; line-height: 16px; padding: 2px 16px; user-select: none; /* sizeSmall */     width: 60px; height: 32px; min-width: 60px; min-height: 32px; /* lookFilled colorPrimary */     color: rgb(255, 255, 255); background-color: var(--button-secondary-background, var(--ud-button-bg)); cursor: pointer; }\n#undiscord button:hover { background-color: var(--button-secondary-background-hover, var(--ud-button-hover)); }\n#undiscord button:focus-visible,\n#undiscord input:focus-visible,\n#undiscord summary:focus-visible,\n#undiscord a:focus-visible { outline: 2px solid var(--focus-primary, var(--ud-input-border-focus)); outline-offset: 2px; }\n#undiscord .sizeMedium { width: 96px; height: 38px; min-width: 96px; min-height: 38px; }\n#undiscord .sizeMedium.icon { width: 38px; min-width: 38px; }\n#undiscord sup { vertical-align: top; }\n/* lookFilled colorPrimary */\n#undiscord .accent { background-color: var(--brand-experiment, var(--brand-500, #5865f2)); }\n#undiscord .danger { background-color: var(--button-danger-background, var(--ud-danger)); }\n#undiscord .danger:hover { background-color: var(--button-danger-background-hover, var(--ud-danger-hover)); }\n#undiscord .positive { background-color: var(--button-positive-background, var(--ud-positive)); }\n#undiscord .positive:hover { background-color: var(--button-positive-background-hover, var(--ud-positive-hover)); }\n#undiscord .info { font-size: 12px; line-height: 16px; padding: 8px 10px; color: var(--text-muted); }\n/* Scrollbar */\n#undiscord .scroll::-webkit-scrollbar { width: 8px; height: 8px; }\n#undiscord .scroll::-webkit-scrollbar-corner { background-color: transparent; }\n#undiscord .scroll::-webkit-scrollbar-thumb { background-clip: padding-box; border: 2px solid transparent; border-radius: 4px; background-color: var(--scrollbar-thin-thumb); min-height: 40px; }\n#undiscord .scroll::-webkit-scrollbar-track { border-color: var(--scrollbar-thin-track); background-color: var(--scrollbar-thin-track); border: 2px solid var(--scrollbar-thin-track); }\n/* fade scrollbar */\n#undiscord .scroll::-webkit-scrollbar-thumb,\n#undiscord .scroll::-webkit-scrollbar-track { visibility: hidden; }\n#undiscord .scroll:hover::-webkit-scrollbar-thumb,\n#undiscord .scroll:hover::-webkit-scrollbar-track { visibility: visible; }\n/**** functional classes ****/\n#undiscord.redact .priv { display: none !important; }\n#undiscord.redact x:not(:active) { color: transparent !important; background-color: var(--primary-700, #5865f2) !important; cursor: default; user-select: none; }\n#undiscord.redact x:hover { position: relative; }\n#undiscord.redact x:hover::after { content: \"Redacted information (Streamer mode: ON)\"; position: absolute; display: inline-block; top: -32px; left: -20px; padding: 4px; width: 150px; font-size: 8pt; text-align: center; white-space: pre-wrap; background-color: var(--background-floating); -webkit-box-shadow: var(--elevation-high); box-shadow: var(--elevation-high); color: var(--text-default); border-radius: 5px; pointer-events: none; }\n#undiscord.redact [priv] { -webkit-text-security: disc !important; }\n#undiscord button:disabled { display: none; }\n/**** layout and utility classes ****/\n#undiscord,\n#undiscord * { box-sizing: border-box; }\n#undiscord .col { display: flex; flex-direction: column; }\n#undiscord .row { display: flex; flex-direction: row; align-items: center; }\n#undiscord .mb1 { margin-bottom: 8px; }\n#undiscord .log { margin-bottom: 0.4em; }\n#undiscord .log-debug { color: inherit; }\n#undiscord .log-info { color: #00b0f4; }\n#undiscord .log-verb { color: #b5bac1; }\n#undiscord .log-warn { color: #faa61a; }\n#undiscord .log-error { color: #f04747; }\n#undiscord .log-success { color: #43b581; }\n";

	var mainCss = "/**** Undiscord Button ****/\n#undiscord-btn { appearance: none; width: 32px; height: 24px; min-width: 32px; margin: 0; padding: 0 4px; border: 0; border-radius: 4px; background: transparent; cursor: pointer; color: var(--interactive-normal); }\n/* The separator belongs to Undiscord and sits on the native-toolbar side. */\n#undiscord-btn::before { content: ''; position: absolute; top: 3px; bottom: 3px; right: -9px; width: 1px; background: #fff; opacity: .72; pointer-events: none; }\n#undiscord-btn:hover,\n#undiscord-btn:focus-visible { color: var(--interactive-hover, #dbdee1); background: var(--background-modifier-hover, rgba(255, 255, 255, .08)); outline: none; }\n#undiscord-btn progress { position: absolute; top: 23px; left: -4px; width: 32px; height: 12px; display: none; }\n#undiscord-btn.running { color: var(--button-danger-background, #da373c) !important; }\n#undiscord-btn.running progress { display: block; }\n#undiscord-btn.undiscord-overlay { position: fixed; z-index: 1001; color: #fff; }\n#undiscord-btn.undiscord-overlay:hover,\n#undiscord-btn.undiscord-overlay:focus-visible { color: #fff; }\n/* The panel has its own trash mark; hide the launcher so it cannot overlap it. */\n#undiscord-btn.undiscord-panel-open { visibility: hidden; pointer-events: none; }\n#undiscord-picker-prompt { position: fixed; z-index: 1002; top: 64px; left: 50%; max-width: min(560px, calc(100vw - 24px)); padding: 10px 14px; transform: translateX(-50%); color: #fff; border: 1px solid rgba(255, 255, 255, .18); border-radius: 6px; background: var(--background-floating, #111214); box-shadow: var(--shadow-high, 0 8px 24px rgba(0, 0, 0, .35)); font: 500 14px/20px var(--font-display, sans-serif); pointer-events: none; }\n/**** Undiscord Interface ****/\n#undiscord { position: fixed; z-index: 100; top: 58px; right: 10px; display: flex; flex-direction: column; width: min(920px, calc(100vw - 24px)); height: min(82vh, 900px); min-width: min(680px, calc(100vw - 24px)); max-width: 100vw; min-height: min(520px, calc(100vh - 68px)); max-height: calc(100vh - 68px); color: var(--text-default, var(--text-normal, #dbdee1)); border-radius: 4px; background-color: var(--background-secondary, var(--ud-surface-raised)); box-shadow: var(--elevation-stroke, 0 0 0 1px rgba(0, 0, 0, .2)), var(--elevation-high, 0 8px 24px rgba(0, 0, 0, .35)); will-change: top, left, width, height; }\n#undiscord .header .icon { cursor: pointer; }\n#undiscord .window-body { height: calc(100% - 48px); }\n#undiscord .sidebar { overflow: hidden scroll; overflow-y: auto; width: 292px; min-width: 292px; height: 100%; max-height: 100%; padding: 8px; background: var(--bg-overlay-4, var(--ud-surface)); }\n#undiscord .sidebar legend,\n#undiscord .sidebar label { display: block; width: 100%; }\n#undiscord .main { display: flex; max-width: calc(100% - 292px); background-color: var(--bg-overlay-chat, var(--ud-surface-sunken)); flex-grow: 1; }\n#undiscord.hide-sidebar .sidebar { display: none; }\n#undiscord.hide-sidebar .main { max-width: 100%; }\n#undiscord #logArea { font-family: Consolas, Liberation Mono, Menlo, Courier, monospace; font-size: 0.75rem; line-height: 1.45; overflow: auto; padding: 10px; user-select: text; flex-grow: 1; cursor: auto; white-space: pre-wrap; overflow-wrap: anywhere; }\n#undiscord #logArea .log-object { display: block; max-height: 14rem; margin-top: 4px; overflow: auto; padding: 8px 10px; border-left: 2px solid currentColor; border-radius: 4px; background: rgba(0, 0, 0, .18); white-space: pre-wrap; }\n#undiscord .tbar { padding: 8px; background-color: var(--bg-overlay-2, var(--__header-bar-background, #232428)); }\n#undiscord .tbar > .row { flex-wrap: wrap; }\n#undiscord .tbar button { margin-right: 4px; margin-bottom: 4px; }\n#undiscord .footer { cursor: default; padding-right: 30px; }\n#undiscord .footer #progressPercent { padding: 0 1em; font-size: small; color: var(--interactive-muted); flex-grow: 1; }\n#undiscord .resize-handle { position: absolute; bottom: -15px; right: -15px; width: 30px; height: 30px; transform: rotate(-45deg); background: repeating-linear-gradient(0, var(--background-modifier-accent), var(--background-modifier-accent) 1px, transparent 2px, transparent 4px); cursor: nwse-resize; }\n/**** Elements ****/\n#undiscord summary { font-size: 16px; font-weight: 500; line-height: 20px; position: relative; overflow: hidden; margin-bottom: 2px; padding: 6px 10px; cursor: pointer; white-space: nowrap; text-overflow: ellipsis; color: var(--interactive-normal); border-radius: 4px; flex-shrink: 0; }\n#undiscord fieldset { min-width: 0; margin: 0; border: 0; padding-left: 8px; }\n#undiscord summary:hover { color: var(--interactive-hover, #dbdee1); background: var(--background-modifier-hover, rgba(255, 255, 255, .06)); }\n#undiscord legend a { float: right; text-transform: initial; }\n#undiscord progress { height: 8px; margin-top: 4px; flex-grow: 1; }\n#undiscord .importJson { display: flex; flex-direction: row; }\n#undiscord .importJson button { margin-left: 5px; width: fit-content; }\n#undiscord .rangeInput { gap: 8px; padding: 0 8px; }\n#undiscord .rangeInput input[type=\"range\"] { min-width: 0; flex: 1 1 auto; }\n#undiscord .rangeInput > div { min-width: 62px; text-align: right; color: var(--text-muted, #b5bac1); font-variant-numeric: tabular-nums; }\n#undiscord .notice { margin-bottom: 12px; padding: 8px; border-left: 3px solid var(--status-danger, #da373c); background: var(--background-mentioned, rgba(240, 178, 50, .1)); }\n#undiscord .log-intro { text-align: center; }\n@media (max-width: 720px) { #undiscord { right: 6px; width: calc(100vw - 12px); min-width: 0; height: calc(100vh - 68px); }\n    #undiscord .header { padding: 0 10px; }\n    #undiscord .header .vert-divider,\n    #undiscord .header > span { display: none; }\n    #undiscord .window-body { flex-direction: column !important; }\n    #undiscord .sidebar { width: 100%; min-width: 0; height: 46%; }\n    #undiscord .main { width: 100%; max-width: 100%; height: 54%; }\n}\n";

	var dragCss = "#undiscord [name^=\"grab-\"] { position: absolute; --size: 6px; --corner-size: 16px; --offset: -1px; z-index: 9; }\n#undiscord [name^=\"grab-\"]:hover{ background: rgba(128,128,128,0.1); }\n#undiscord [name=\"grab-t\"] { top: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-top: var(--offset); cursor: ns-resize; }\n#undiscord [name=\"grab-r\"] { top: var(--corner-size); bottom: var(--corner-size); right: 0px; width: var(--size); margin-right: var(--offset); \n  cursor: ew-resize; }\n#undiscord [name=\"grab-b\"] { bottom: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-bottom: var(--offset); cursor: ns-resize; }\n#undiscord [name=\"grab-l\"] { top: var(--corner-size); bottom: var(--corner-size); left: 0px; width: var(--size); margin-left: var(--offset); cursor: ew-resize; }\n#undiscord [name=\"grab-tl\"] { top: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-left: var(--offset); cursor: nwse-resize; }\n#undiscord [name=\"grab-tr\"] { top: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-right: var(--offset); cursor: nesw-resize; }\n#undiscord [name=\"grab-br\"] { bottom: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-right: var(--offset); cursor: nwse-resize; }\n#undiscord [name=\"grab-bl\"] { bottom: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-left: var(--offset); cursor: nesw-resize; }\n";

	var buttonHtml = "<button id=\"undiscord-btn\" type=\"button\" aria-label=\"Delete Messages with Undiscord\" aria-expanded=\"false\" title=\"Delete Messages with Undiscord\">\n    <svg aria-hidden=\"true\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n        <path fill=\"currentColor\" d=\"M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z\"></path>\r\n        <path fill=\"currentColor\" d=\"M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z\"></path>\r\n    </svg>\r\n    <progress></progress>\r\n</button>\n";

	var undiscordTemplate = "<div id=\"undiscord\" class=\"browser container\" role=\"dialog\" aria-label=\"Undiscord bulk message deletion\" style=\"display:none;\">\n    <div class=\"header\">\r\n        <svg class=\"icon\" aria-hidden=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\r\n            <path fill=\"currentColor\" d=\"M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z\"></path>\r\n            <path fill=\"currentColor\"\r\n                d=\"M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z\">\r\n            </path>\r\n        </svg>\r\n        <h3>Undiscord</h3>\r\n        <div class=\"vert-divider\"></div>\r\n        <span> Bulk delete messages</span>\r\n        <div class=\"spacer\"></div>\r\n        <button id=\"hide\" class=\"icon\" type=\"button\" aria-label=\"Close Undiscord\" title=\"Close Undiscord\">\n            <svg aria-hidden=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\r\n                <path fill=\"currentColor\"\r\n                    d=\"M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z\">\r\n                </path>\r\n            </svg>\r\n        </button>\n    </div>\r\n    <div class=\"window-body\" style=\"display: flex; flex-direction: row;\">\r\n        <div class=\"sidebar scroll\">\r\n            <details open>\r\n                <summary>General</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Author ID\r\n                        <a href=\"{{WIKI}}/authorId\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input class=\"input\" id=\"authorId\" type=\"text\" aria-label=\"Author ID\" inputmode=\"numeric\" priv>\n                        </div>\r\n                        <button id=\"getAuthor\" type=\"button\">me</button>\n                    </div>\r\n                </fieldset>\r\n                <hr>\r\n                <fieldset>\r\n                    <legend>\r\n                        Server ID\r\n                        <a href=\"{{WIKI}}/guildId\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input class=\"input\" id=\"guildId\" type=\"text\" aria-label=\"Server ID\" priv>\n                        </div>\r\n                        <button id=\"getGuild\" type=\"button\">current</button>\n                    </div>\r\n                </fieldset>\r\n                <fieldset>\r\n                    <legend>\r\n                        Channel ID\r\n                        <a href=\"{{WIKI}}/channelId\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput mb1\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input class=\"input\" id=\"channelId\" type=\"text\" aria-label=\"Channel ID\" priv>\n                        </div>\r\n                        <button id=\"getChannel\" type=\"button\">current</button>\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <label class=\"row\"><input id=\"includeNsfw\" type=\"checkbox\">This is a NSFW channel</label>\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <details>\r\n                <summary>Wipe Archive</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Import index.json\r\n                        <a href=\"{{WIKI}}/importJson\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper\">\r\n                        <input type=\"file\" id=\"importJsonInput\" aria-label=\"Import Discord messages index JSON\" accept=\"application/json,.json\" style=\"width:100%;\">\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <br>\r\n                        After requesting your data from discord, you can import it here.<br>\r\n                        Select the \"messages/index.json\" file from the discord archive.\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <hr>\r\n            <details>\r\n                <summary>Filter</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Search\r\n                        <a href=\"{{WIKI}}/filters\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper\">\r\n                        <input id=\"search\" type=\"text\" aria-label=\"Message text filter\" placeholder=\"Containing text\" priv>\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        Only delete messages that contain the text\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <label><input id=\"hasLink\" type=\"checkbox\">has: link</label>\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <label><input id=\"hasFile\" type=\"checkbox\">has: file</label>\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        <label><input id=\"includePinned\" type=\"checkbox\">Include pinned</label>\r\n                    </div>\r\n                </fieldset>\r\n                <hr>\r\n                <fieldset>\r\n                    <legend>\r\n                        Pattern\r\n                        <a href=\"{{WIKI}}/pattern\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"sectionDescription\">\r\n                        Delete messages that match the regular expression\r\n                    </div>\r\n                    <div class=\"input-wrapper\">\r\n                        <span class=\"info\">/</span>\r\n                        <input id=\"pattern\" type=\"text\" aria-label=\"Regular expression filter\" placeholder=\"regular expression\" priv>\n                        <span class=\"info\">/</span>\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <details>\r\n                <summary>Messages interval</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Interval of messages\r\n                        <a href=\"{{WIKI}}/messageId\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput mb1\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input id=\"minId\" type=\"text\" aria-label=\"Delete after message ID\" placeholder=\"After a message\" inputmode=\"numeric\" priv>\n                        </div>\r\n                        <button id=\"pickMessageAfter\" type=\"button\">Pick</button>\n                    </div>\r\n                    <div class=\"multiInput\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input id=\"maxId\" type=\"text\" aria-label=\"Delete before message ID\" placeholder=\"Before a message\" inputmode=\"numeric\" priv>\n                        </div>\r\n                        <button id=\"pickMessageBefore\" type=\"button\">Pick</button>\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        Specify an interval to delete messages.\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <details>\r\n                <summary>Date interval</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        After date\r\n                        <a href=\"{{WIKI}}/dateRange\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper mb1\">\r\n                        <input id=\"minDate\" type=\"datetime-local\" aria-label=\"Delete messages after date\" title=\"Messages posted AFTER this date\">\n                    </div>\r\n                    <legend>\r\n                        Before date\r\n                        <a href=\"{{WIKI}}/dateRange\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper\">\r\n                        <input id=\"maxDate\" type=\"datetime-local\" aria-label=\"Delete messages before date\" title=\"Messages posted BEFORE this date\">\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        Delete messages that were posted between the two dates.\r\n                    </div>\r\n                    <div class=\"sectionDescription\">\r\n                        * Filtering by date doesn't work if you use the \"Messages interval\".\r\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <hr>\r\n            <details>\r\n                <summary>Advanced settings</summary>\r\n                <fieldset>\r\n                    <legend>\r\n                        Search delay\r\n                        <a href=\"{{WIKI}}/delay\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper rangeInput\">\n                        <input id=\"searchDelay\" type=\"range\" aria-label=\"Search delay in milliseconds\" min=\"100\" max=\"60000\" step=\"100\" value=\"30000\">\n                        <div id=\"searchDelayValue\"></div>\r\n                    </div>\r\n                </fieldset>\r\n                <fieldset>\r\n                    <legend>\r\n                        Delete delay\r\n                        <a href=\"{{WIKI}}/delay\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"input-wrapper rangeInput\">\n                        <input id=\"deleteDelay\" type=\"range\" aria-label=\"Delete delay in milliseconds\" min=\"50\" max=\"10000\" step=\"50\" value=\"1000\">\n                        <div id=\"deleteDelayValue\"></div>\r\n                    </div>\r\n                    <br>\r\n                    <div class=\"sectionDescription\">\r\n                        This will affect the speed in which the messages are deleted.\r\n                        Use the help link for more information.\r\n                    </div>\r\n                </fieldset>\r\n                <hr>\r\n                <fieldset>\r\n                    <legend>\r\n                        Authorization Token\r\n                        <a href=\"{{WIKI}}/authToken\" title=\"Help\" target=\"_blank\" rel=\"noopener noreferrer\">help</a>\r\n                    </legend>\r\n                    <div class=\"multiInput\">\r\n                        <div class=\"input-wrapper\">\r\n                            <input class=\"input\" id=\"token\" type=\"password\" aria-label=\"Discord authorization token\" autocomplete=\"off\" priv>\n                        </div>\r\n                        <button id=\"getToken\" type=\"button\">fill</button>\n                    </div>\r\n                </fieldset>\r\n            </details>\r\n            <hr>\r\n            <div></div>\r\n            <div class=\"info\">\r\n                Undiscord {{VERSION}}\r\n                <br> victornpb\r\n            </div>\r\n        </div>\r\n        <div class=\"main col\">\r\n            <div class=\"tbar col\">\r\n                <div class=\"row\">\r\n                    <button id=\"toggleSidebar\" class=\"sizeMedium icon\" type=\"button\" aria-label=\"Toggle settings sidebar\" aria-expanded=\"true\">☰</button>\n                    <button id=\"start\" class=\"sizeMedium danger\" type=\"button\" style=\"width: 150px;\" title=\"Start the deletion process\">▶︎ Delete</button>\n                    <button id=\"stop\" class=\"sizeMedium\" type=\"button\" title=\"Stop the deletion process\" disabled>🛑 Stop</button>\n                    <button id=\"clear\" class=\"sizeMedium\" type=\"button\">Clear log</button>\n                    <label class=\"row\" title=\"Hide sensitive information on your screen for taking screenshots\">\r\n                        <input id=\"redact\" type=\"checkbox\"> Streamer mode\n                    </label>\r\n                </div>\r\n                <div class=\"row\">\r\n                    <progress id=\"progressBar\" style=\"display:none;\"></progress>\r\n                </div>\r\n            </div>\r\n            <div id=\"logArea\" class=\"logarea scroll\" role=\"log\" aria-live=\"polite\" aria-label=\"Undiscord activity log\">\n                <div class=\"notice\">Review the selected IDs and filters carefully before deleting. Deleted messages cannot be restored.</div>\n                <div class=\"log-intro\">\n                    <div>Star <a href=\"{{HOME}}\" target=\"_blank\" rel=\"noopener noreferrer\">this project</a> on GitHub!</div>\r\n                    <div><a href=\"{{HOME}}/discussions\" target=\"_blank\" rel=\"noopener noreferrer\">Issues or help</a></div>\r\n                </div>\n            </div>\n            <div class=\"tbar footer row\">\r\n                <div id=\"progressPercent\" role=\"status\" aria-live=\"polite\"></div>\n                <span class=\"spacer\"></span>\r\n                <label title=\"Keep the Undiscord activity log pinned to its newest entry\">\n                    <input id=\"autoScroll\" type=\"checkbox\" checked> Auto-scroll log\n                </label>\n                <div class=\"resize-handle\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n";

	const log = {
	  debug() { return logFn ? logFn('debug', arguments) : console.debug.apply(console, arguments); },
	  info() { return logFn ? logFn('info', arguments) : console.info.apply(console, arguments); },
	  verb() { return logFn ? logFn('verb', arguments) : console.log.apply(console, arguments); },
	  warn() { return logFn ? logFn('warn', arguments) : console.warn.apply(console, arguments); },
	  error() { return logFn ? logFn('error', arguments) : console.error.apply(console, arguments); },
	  success() { return logFn ? logFn('success', arguments) : console.info.apply(console, arguments); },
	};

	var logFn; // custom console.log function
	const setLogFn = (fn) => logFn = fn;

	// Helpers
	const DISCORD_EPOCH = 1420070400000n;

	const wait = async ms => new Promise(done => setTimeout(done, Math.max(0, Number(ms) || 0)));
	const msToHMS = value => {
	  const ms = Math.max(0, Number(value) || 0);
	  return `${ms / 3.6e6 | 0}h ${(ms % 3.6e6) / 6e4 | 0}m ${(ms % 6e4) / 1000 | 0}s`;
	};
	const escapeHTML = html => String(html).replace(/[&<>"']/g, m => ({
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  '\'': '&#039;',
	})[m]);
	const redact = str => `<x>${escapeHTML(str)}</x>`;
	const queryString = params => params
	  .filter(p => p[1] !== undefined)
	  .map(p => p[0] + '=' + encodeURIComponent(p[1]))
	  .join('&');
	const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));

	/** Convert a datetime-local value to an exact Discord snowflake string. */
	const toSnowflake = value => {
	  const input = String(value ?? '').trim();
	  if (!input) return '';
	  if (/^\d+$/.test(input)) return input;

	  const timestamp = new Date(input).getTime();
	  if (!Number.isFinite(timestamp) || timestamp < Number(DISCORD_EPOCH)) return null;
	  return ((BigInt(timestamp) - DISCORD_EPOCH) << 22n).toString();
	};

	const replaceInterpolations = (str, obj, removeMissing = false) => str.replace(/\{\{([\w_]+)\}\}/g, (match, key) => {
	  if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== null && obj[key] !== undefined) {
	    return String(obj[key]);
	  }
	  return removeMissing ? '' : match;
	});

	const PREFIX$1 = '[UNDISCORD]';

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
	      console.debug(PREFIX$1, 'Search page received.', { totalResults: data.total_results, groups: data.messages.length });
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

	    console.debug(PREFIX$1, 'Search page filtered.', {
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

	const MOVE = 0;
	const RESIZE_T = 1;
	const RESIZE_B = 2;
	const RESIZE_L = 4;
	const RESIZE_R = 8;
	const RESIZE_TL = RESIZE_T + RESIZE_L;
	const RESIZE_TR = RESIZE_T + RESIZE_R;
	const RESIZE_BL = RESIZE_B + RESIZE_L;
	const RESIZE_BR = RESIZE_B + RESIZE_R;

	/**
	 * Make an element draggable/resizable
	 * @author Victor N. wwww.vitim.us
	 */
	class DragResize {
	  constructor({ elm, moveHandle, options }) {
	    this.options = defaultArgs({
	      enabledDrag: true,
	      enabledResize: true,
	      minWidth: 200,
	      maxWidth: Infinity,
	      minHeight: 100,
	      maxHeight: Infinity,
	      dragAllowX: true,
	      dragAllowY: true,
	      resizeAllowX: true,
	      resizeAllowY: true,
	      draggingClass: 'drag',
	      useMouseEvents: true,
	      useTouchEvents: true,
	      createHandlers: true,
	    }, options);
	    Object.assign(this, options);

	    elm.style.position = 'fixed';

	    this.drag_m = new Draggable(elm, moveHandle, MOVE, this.options);

	    if (this.options.createHandlers) {
	      this.el_t = createElement('div', { name: 'grab-t' }, elm);
	      this.drag_t = new Draggable(elm, this.el_t, RESIZE_T, this.options);
	      this.el_r = createElement('div', { name: 'grab-r' }, elm);
	      this.drag_r = new Draggable(elm, this.el_r, RESIZE_R, this.options);
	      this.el_b = createElement('div', { name: 'grab-b' }, elm);
	      this.drag_b = new Draggable(elm, this.el_b, RESIZE_B, this.options);
	      this.el_l = createElement('div', { name: 'grab-l' }, elm);
	      this.drag_l = new Draggable(elm, this.el_l, RESIZE_L, this.options);
	      this.el_tl = createElement('div', { name: 'grab-tl' }, elm);
	      this.drag_tl = new Draggable(elm, this.el_tl, RESIZE_TL, this.options);
	      this.el_tr = createElement('div', { name: 'grab-tr' }, elm);
	      this.drag_tr = new Draggable(elm, this.el_tr, RESIZE_TR, this.options);
	      this.el_br = createElement('div', { name: 'grab-br' }, elm);
	      this.drag_br = new Draggable(elm, this.el_br, RESIZE_BR, this.options);
	      this.el_bl = createElement('div', { name: 'grab-bl' }, elm);
	      this.drag_bl = new Draggable(elm, this.el_bl, RESIZE_BL, this.options);
	    }
	  }
	}

	class Draggable {
	  constructor(targetElm, handleElm, op, options) {
	    Object.assign(this, options);

	    this._targetElm = targetElm;
	    this._handleElm = handleElm;

	    let vw = window.innerWidth;
	    let vh = window.innerHeight;
	    let initialX, initialY, initialT, initialL, initialW, initialH;

	    const clamp = (value, min, max) => value < min ? min : value > max ? max : value;

	    const moveOp = (x, y) => {
	      const deltaX = (x - initialX);
	      const deltaY = (y - initialY);
	      const t = clamp(initialT + deltaY, 0, vh - initialH);
	      const l = clamp(initialL + deltaX, 0, vw - initialW);
	      this._targetElm.style.top = t + 'px';
	      this._targetElm.style.left = l + 'px';
	    };

	    const resizeOp = (x, y) => {
	      x = clamp(x, 0, vw);
	      y = clamp(y, 0, vh);
	      const deltaX = (x - initialX);
	      const deltaY = (y - initialY);
	      const resizeDirX = (op & RESIZE_L) ? -1 : 1;
	      const resizeDirY = (op & RESIZE_T) ? -1 : 1;
	      const deltaXMax = (this.maxWidth - initialW);
	      const deltaXMin = (this.minWidth - initialW);
	      const deltaYMax = (this.maxHeight - initialH);
	      const deltaYMin = (this.minHeight - initialH);
	      const t = initialT + clamp(deltaY * resizeDirY, deltaYMin, deltaYMax) * resizeDirY;
	      const l = initialL + clamp(deltaX * resizeDirX, deltaXMin, deltaXMax) * resizeDirX;
	      const w = initialW + clamp(deltaX * resizeDirX, deltaXMin, deltaXMax);
	      const h = initialH + clamp(deltaY * resizeDirY, deltaYMin, deltaYMax);
	      if (op & RESIZE_T) { // resize ↑
	        this._targetElm.style.top = t + 'px';
	        this._targetElm.style.height = h + 'px';
	      }
	      if (op & RESIZE_B) { // resize ↓
	        this._targetElm.style.height = h + 'px';
	      }
	      if (op & RESIZE_L) { // resize ←
	        this._targetElm.style.left = l + 'px';
	        this._targetElm.style.width = w + 'px';
	      }
	      if (op & RESIZE_R) { // resize →
	        this._targetElm.style.width = w + 'px';
	      }
	    };

	    let operation = op === MOVE ? moveOp : resizeOp;

	    function dragStartHandler(e) {
	      const touch = e.type === 'touchstart';
	      if ((e.buttons === 1 || e.which === 1) || touch) {
	        e.preventDefault();
	        const x = touch ? e.touches[0].clientX : e.clientX;
	        const y = touch ? e.touches[0].clientY : e.clientY;
	        initialX = x;
	        initialY = y;
	        vw = window.innerWidth;
	        vh = window.innerHeight;
	        initialT = this._targetElm.offsetTop;
	        initialL = this._targetElm.offsetLeft;
	        initialW = this._targetElm.clientWidth;
	        initialH = this._targetElm.clientHeight;
	        if (this.useMouseEvents) {
	          document.addEventListener('mousemove', this._dragMoveHandler);
	          document.addEventListener('mouseup', this._dragEndHandler);
	        }
	        if (this.useTouchEvents) {
	          document.addEventListener('touchmove', this._dragMoveHandler, { passive: false });
	          document.addEventListener('touchend', this._dragEndHandler);
	        }
	        this._targetElm.classList.add(this.draggingClass);
	      }
	    }

	    function dragMoveHandler(e) {
	      e.preventDefault();
	      let x, y;
	      const touch = e.type === 'touchmove';
	      if (touch) {
	        const t = e.touches[0];
	        x = t.clientX;
	        y = t.clientY;
	      } else { //mouse
	        // If the button is not down, dispatch a "fake" mouse up event, to stop listening to mousemove
	        // This happens when the mouseup is not captured (outside the browser)
	        if ((e.buttons || e.which) !== 1) {
	          this._dragEndHandler();
	          return;
	        }
	        x = e.clientX;
	        y = e.clientY;
	      }
	      // perform drag / resize operation
	      operation(x, y);
	    }

	    function dragEndHandler(e) {
	      if (this.useMouseEvents) {
	        document.removeEventListener('mousemove', this._dragMoveHandler);
	        document.removeEventListener('mouseup', this._dragEndHandler);
	      }
	      if (this.useTouchEvents) {
	        document.removeEventListener('touchmove', this._dragMoveHandler);
	        document.removeEventListener('touchend', this._dragEndHandler);
	      }
	      this._targetElm.classList.remove(this.draggingClass);
	    }

	    // We need to bind the handlers to this instance
	    this._dragStartHandler = dragStartHandler.bind(this);
	    this._dragMoveHandler = dragMoveHandler.bind(this);
	    this._dragEndHandler = dragEndHandler.bind(this);

	    this.enable();
	  }

	  /** Turn on the drag and drop of the instance */
	  enable() {
	    this.destroy(); // prevent events from getting binded twice
	    if (this.useMouseEvents) this._handleElm.addEventListener('mousedown', this._dragStartHandler);
	    if (this.useTouchEvents) this._handleElm.addEventListener('touchstart', this._dragStartHandler, { passive: false });
	  }

	  /** Teardown all events bound to the document and elements. You can resurrect this instance by calling enable() */
	  destroy() {
	    this._targetElm.classList.remove(this.draggingClass);
	    if (this.useMouseEvents) {
	      this._handleElm.removeEventListener('mousedown', this._dragStartHandler);
	      document.removeEventListener('mousemove', this._dragMoveHandler);
	      document.removeEventListener('mouseup', this._dragEndHandler);
	    }
	    if (this.useTouchEvents) {
	      this._handleElm.removeEventListener('touchstart', this._dragStartHandler);
	      document.removeEventListener('touchmove', this._dragMoveHandler);
	      document.removeEventListener('touchend', this._dragEndHandler);
	    }
	  }
	}

	function createElement(tag='div', attrs, parent) {
	  const elm = document.createElement(tag);
	  if (attrs) Object.entries(attrs).forEach(([k, v]) => elm.setAttribute(k, v));
	  if (parent) parent.appendChild(elm);
	  return elm;
	}

	function defaultArgs(defaults, options) {
	  function isObj(x) { return x !== null && typeof x === 'object'; }
	  function hasOwn(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
	  if (isObj(options)) for (let prop in defaults) {
	    if (hasOwn(defaults, prop) && hasOwn(options, prop) && options[prop] !== undefined) {
	      if (isObj(defaults[prop])) defaultArgs(defaults[prop], options[prop]);
	      else defaults[prop] = options[prop];
	    }
	  }
	  return defaults;
	}

	function createElm(html) {
	  const temp = document.createElement('div');
	  temp.innerHTML = html;
	  return temp.removeChild(temp.firstElementChild);
	}

	function insertCss(css) {
	  const style = document.createElement('style');
	  style.appendChild(document.createTextNode(css));
	  document.head.appendChild(style);
	  return style;
	}

	const messagePicker = {
	  grab(auxiliary) {
	    return new Promise(resolve => {
	      let settled = false;

	      const timeout = setTimeout(() => finish(null), 30000);

	      function cleanup() {
	        clearTimeout(timeout);
	        document.removeEventListener('click', clickHandler, true);
	        document.removeEventListener('keydown', keyHandler, true);
	      }

	      function finish(value) {
	        if (settled) return;
	        settled = true;
	        cleanup();
	        resolve(value);
	      }

	      function keyHandler(e) {
	        if (e.key === 'Escape') {
	          finish(null);
	        }
	      }

	      function clickHandler(e) {
	        const message = e.target.closest('[id^="message-content-"], [id^="chat-messages-"]');
	        if (message) {
	          e.preventDefault();
	          e.stopPropagation();
	          e.stopImmediatePropagation();
	          try {
	            const match = message.id.match(/message-content-(\d+)/) || message.id.match(/chat-messages-\d+-(\d+)/);
	            finish(match?.[1] || null);
	          } catch {
	            finish(null);
	          }
	        }
	      }
	      document.addEventListener('click', clickHandler, true);
	      document.addEventListener('keydown', keyHandler, true);
	    });
	  }
	};

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

	function getToken() {
	  const storedToken = readLocalStorageJson('token');
	  if (storedToken) return storedToken;

	  log.info('Could not automatically detect Authorization Token in local storage!');
	  log.info('Attempting to grab token using webpack');
	  const tokenStore = findWebpackExport('getToken');
	  const token = tokenStore?.getToken();
	  if (!token) throw new Error('Discord token store was not found.');
	  return token;
	}

	function getAuthorId() {
	  const storedId = readLocalStorageJson('user_id_cache');
	  if (storedId) return storedId;

	  const userStore = findWebpackExport('getCurrentUser');
	  const authorId = userStore?.getCurrentUser()?.id;
	  if (!authorId) throw new Error('Discord current-user store was not found.');
	  return authorId;
	}

	function getGuildId() {
	  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
	  if (m) return m[1];
	  log.error('Could not find the Server ID. Make sure you are viewing a server channel or DM.');
	}

	function getChannelId() {
	  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
	  if (m) return m[2];
	  log.error('Could not find the Channel ID. Make sure you are viewing a server channel or DM.');
	}

	function fillToken() {
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

	const PREFIX = '[UNDISCORD]';

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
	  new DragResize({ elm: ui.undiscordWindow, moveHandle: $('.header') });

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

	// ---- END Undiscord ----

	initUI();

})();
