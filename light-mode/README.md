# Light Mode

A static, installable web app (PWA) that gives your iPhone a Light Phone /
Light OS–style distraction-free companion screen: a focus-session timer plus
eight minimal tools (Alarm, Calculator, Notes, Tasks, Weather, Directions,
Podcasts, Music). No backend, no account — everything lives in your phone's
browser storage. See the full design at
`docs/superpowers/specs/2026-07-21-light-mode-webapp-design.md`.

It cannot block or hide other apps — that's outside what a web app is
allowed to do on iOS. It's a focus companion, not an enforcer.

## One-time setup to make this live

This repo has a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`)
that deploys the `light-mode/` folder to GitHub Pages on every push. GitHub
Pages itself needs to be turned on once, by a repo owner:

1. Go to the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push (or re-run the workflow from the **Actions** tab) — the app will be
   live at `https://<owner>.github.io/<repo>/`.

## Installing on your iPhone

1. Open the deployed URL in **Safari** (must be Safari, not Chrome — only
   Safari supports "Add to Home Screen" as a standalone app on iOS).
2. Tap the **Share** icon → **Add to Home Screen** → **Add**.
3. Launch it from the home screen icon — it opens full-screen, no browser
   chrome.

## Manual test checklist

Run through these on a real iPhone after installing, since this project was
built without access to an iOS device or simulator:

- [ ] App icon appears correctly on the home screen and launches standalone
      (no Safari address bar).
- [ ] Tap **Enter Light Mode** → timer starts counting up from `00:00:00`.
- [ ] Close the tab/app and reopen within a minute → timer resumes from
      where it was (session survives a reload).
- [ ] Tap **Exit Light Mode** → timer stops and resets, button reverts.
- [ ] **Alarm**: set a time one minute in the future, keep the app open and
      the phone unlocked → alert + sound fires at that time. Confirm the
      on-screen disclaimer about background limitations is visible.
- [ ] **Calculator**: `12 + 8 =` → `20`. `5 ÷ 0 =` → shows `Error`, not a
      crash.
- [ ] **Notes**: add a note, reload the page → note persists. Edit it, then
      delete it.
- [ ] **Tasks**: add a task, check it off (strikethrough appears), delete it.
- [ ] **Weather**: allow location access → current temperature and
      conditions appear. Deny location access → a plain-language message
      appears instead of a silent failure.
- [ ] **Directions**: type an address, tap **Open in Maps** → native Apple
      Maps opens with that search.
- [ ] **Podcasts** / **Music**: tapping either tile opens the respective
      Apple app/website in a new tab.
- [ ] Turn on Airplane Mode after the first successful load, then relaunch
      the app → it still opens (offline app-shell caching via the service
      worker).
