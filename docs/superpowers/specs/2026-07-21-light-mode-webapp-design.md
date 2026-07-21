# Light Mode PWA — Design Spec

Date: 2026-07-21

## Summary

A static, installable Progressive Web App (PWA) that gives an iPhone a Light
Phone / Light OS–style distraction-free companion screen. No backend, no
build step, no account. Lives in a new `light-mode/` folder in this repo,
alongside (and independent of) the existing R programming assignment files.

## Goals

- Installable to the iOS home screen via Safari's "Add to Home Screen,"
  running standalone (no browser chrome).
- A "Light Mode" focus session: a toggle that starts/stops a live elapsed
  timer and shows soft, positive nudges — no enforcement, since a web app
  cannot block or hide other iOS apps.
- A grid of 8 tools mirroring the real Light Phone II tool set: Alarm,
  Calculator, Notes, Tasks, Weather, Directions, Podcasts, Music.
- Visual style: flat, high-contrast grayscale (black/white/gray only),
  generous whitespace, no decorative icons — evokes an e-ink Light OS look.
- Works offline after first load (app shell cached via service worker).
- All user data (notes, tasks, alarm time) stored locally on-device only
  (`localStorage`); nothing leaves the phone.

## Non-goals

- Cannot block, hide, or restrict other apps on the phone — that requires
  native iOS APIs (Screen Time / Family Controls), which a web app cannot
  access. Explicitly out of scope for this project.
- No reliable background alarm — iOS suspends backgrounded/locked Safari
  tabs, so the in-app alarm only fires while the tab is open and the phone
  is unlocked. The UI must say this plainly next to the Alarm tool.
- No user accounts, no server, no analytics, no third-party tracking.
- No native app wrapper (no Capacitor/Cordova) — pure web PWA only.

## Architecture

- Plain HTML/CSS/JS, no framework, no build tooling. Keeps the app tiny,
  fast to load, and trivially deployable as static files.
- Directory layout (all under `light-mode/`):
  - `index.html` — single page containing the Light Mode toggle/timer and
    the tools grid; each tool is a modal/section shown in-page (no route
    changes, no page reloads, so state and the timer persist smoothly).
  - `css/style.css` — grayscale visual system, layout.
  - `js/app.js` — Light Mode session state, timer, nudge banner logic,
    tool interactions, `localStorage` persistence.
  - `sw.js` at the app root (registered from `js/app.js`) — service
    worker: caches the app shell (HTML/CSS/JS/icons) on install, serves
    cache-first, falls back to network for the weather API call (never
    cached, since it's time-sensitive data). Must live at the app root,
    not under `js/`, because a service worker's default control scope is
    its own script's directory and below — placing it under `js/` would
    stop it from ever controlling `index.html`.
  - `manifest.json` — PWA manifest: `display: standalone`, grayscale
    `theme_color`/`background_color`, icon set.
  - `icons/` — home-screen icon PNGs (multiple sizes) + `apple-touch-icon`.
- Deployment: `.github/workflows/deploy-pages.yml` — GitHub Actions
  workflow that uploads `light-mode/` as the Pages artifact and deploys on
  every push to the default branch. Requires a one-time manual step by the
  repo owner: Settings → Pages → Source → "GitHub Actions." (No available
  tool/API in this session can flip that toggle — it's a repo-owner-only
  setting.)

## Light Mode session behavior

- A single large toggle button on the home screen: "Enter Light Mode" /
  "Exit Light Mode."
- On enter: record a start timestamp (in-memory + `localStorage`, so a
  page reload mid-session doesn't lose the running timer); start a
  `setInterval` updating a live `HH:MM:SS` elapsed display.
- Every 20 minutes of active session time, show a small dismissible banner
  with a positive-framed message (e.g. "You've been focused for 20
  minutes."). No further nudge until the next 20-minute mark. Banners are
  purely encouraging — never guilt- or urgency-framed.
- On exit: stop the timer, clear the running-session state. (No history/
  streak tracking in this MVP — out of scope unless requested later.)
- The tools grid is reachable regardless of Light Mode state; the session
  toggle only affects the timer/nudges and a subtle visual shift (e.g. a
  slightly different border/shade) — it does not gate access to tools.

## Tools

| Tool | Behavior |
|---|---|
| Alarm | Pick a time; if the tab stays open and unlocked, an in-page alert + sound fires at that time. UI text explicitly states this is not a background alarm. |
| Calculator | Basic arithmetic calculator, built in-page. |
| Notes | Local list of plain-text notes: add, edit, delete. `localStorage`. |
| Tasks | Local checklist: add, check off, delete. `localStorage`. |
| Weather | Current conditions for the user's location via Open-Meteo (free, no API key). Requests geolocation permission; on denial, shows a manual-refresh prompt with no location fallback message. |
| Directions | Text field for a place/address; "Go" opens `https://maps.apple.com/?q=<query>` in a new tab, which hands off to the native Maps app on iOS. |
| Podcasts | One-tap link to `https://podcasts.apple.com/`. |
| Music | One-tap link to `https://music.apple.com/`. |

## Error handling

- Geolocation denied/unavailable → Weather tool shows a plain-text message
  ("Location unavailable — enable it in Settings to see weather.") instead
  of silently failing.
- Weather API request fails/times out → show a retry button, no crash.
- `localStorage` unavailable (e.g. private browsing edge cases) → Notes/
  Tasks/Alarm degrade to in-memory-only for that session with a small
  notice, rather than throwing.
- Service worker registration failure → app still works online; it just
  won't cache for offline use. Fails silently (console log only), since
  it's a progressive enhancement, not a required feature.

## Testing

This session has no iOS device/simulator and no Xcode, so nothing here can
be run against real Safari/iOS behavior directly. Verification plan:
- Manual smoke test file (or README section) listing exact steps to run on
  a real iPhone after deploy: install to home screen, launch standalone,
  toggle Light Mode, use each tool, verify offline reload, verify weather
  permission prompt, verify alarm fires while tab open.
- Any logic worth unit-testing (e.g. elapsed-time formatting, nudge
  interval math) gets plain-JS functions extracted so they're at least
  visually/manually checkable in a desktop browser console during
  development, even without a phone.

## Open questions / deferred

- None blocking. Possible future asks (not in this spec): streak/history
  tracking across sessions, push-notification-based reminders (iOS 16.4+
  supports Web Push for installed PWAs, but adds real complexity and
  reliability caveats — defer until asked).
