# Perfection loop round 1 handoff — PASS

Date: 2026-08-28
Work order: `headless-scheduler-polish-1-all-findings`
Review source: `31d62e1fe21ca9c8a7dbe63f94589fad29cf8629`
Candidate base: `a2e3ef844130c414b7b43d6e36f09b02227f38df`
Release commit: `9dd9b8147b21e0d6330d7c768fc9e3447d84d431`
Live URL: <https://headless-scheduler.sociobot.in>

## Delivered

- Replaced the first screen with a short job-first headline, named audience, one `/?demo=1` sample action, its outcome, and three tested facts.
- Added the isolated in-memory package playground, five realistic events, editable JSON, live output, persistent demo banner, reset, exit, reload reset, and installable versioned release file.
- Added 32 claims with exactly one `@claim:<id>` test each. Coverage includes package formats/types/license/dependencies, public APIs, all input modes, accessibility, time zones, adapters, React 18/19, privacy, offline, routing, headers, and the static artifact.
- Corrected NodeNext declarations, strict ISO event boundaries, model-derived timeline positions, dialog focus return, mobile touch targets, heading order, first-screen fit, and sticky mobile demo controls.
- Added real route documents and metadata for Home, Demo, Privacy, Terms, and 404, plus focus/announcement behavior, legal links, social art, icons, sitemap, security headers, and true unknown-route 404 responses.
- Rewrote the landing page and README in plain language, added the required three-step and limits/privacy sections, recorded the copy audit, and changed the catalog description to an 88-character verb-first sentence.
- Preserved the product-specific warm-paper, cobalt/tomato risograph inkboard identity.

Every review item is mapped to its fix and evidence in `.factory/polish-1.md`.

## Clean-clone verification

A new checkout of exact commit `9dd9b8147b21e0d6330d7c768fc9e3447d84d431` at `/tmp/headless-scheduler-9dd9b81-nlzQ9z` ran after `npm ci --ignore-scripts --no-audit --no-fund`:

- `npm test` — 29/29 passed.
- `npm run check` — library and site TypeScript checks passed.
- `npm run test:claims` — 33/33 passed; 32/32 registered claim tags passed and the one-to-one registry check passed.
- `npm run check:pack` — clean ESM, CommonJS, React, declaration, CSS, timezone, and validation consumers passed.
- The preceding clean checkout also passed `npm run check:smoke`, `check:a11y`, `check:headers`, `check:offline`, `check:pwa-update`, `check:visual`, `npm audit --omit=dev`, and `npm pack --dry-run`. All source/product changes were identical; the final commit changes only the live-origin portability of the privacy assertion.
- `npm pack --dry-run` — 24 files, 40,567 bytes packed, 141,641 bytes unpacked.
- Built site — JavaScript 55.12 kB raw / 19.50 kB gzip; CSS 22.69 kB raw / 5.70 kB gzip.
- All 32 claims were also invoked separately; `.factory/evidence/polish-1/claim-matrix-clean.json` records 32 passes.

## Production verification

Azure Static Web Apps deployment `e875abba-12bd-49e0-be42-d0caf76cb7a2` completed successfully. The custom domain reported Ready, and a no-cache cold request returned build marker `9dd9b81`.

- Factory URL verifier: HTTP 200, correct title and language, one H1, main landmark, complete alt/labels, zero console errors.
- Live Playwright claims: 33/33 passed against `https://headless-scheduler.sociobot.in`.
- Live smoke: 390 × 844 and 1440 × 900 passed add, move, resize, month navigation, live announcements, layout, and console checks.
- Live axe: zero violations on `/`, `/demo`, `/privacy`, `/terms`, and the 404 state.
- Live routes: Home, Demo, Privacy, and Terms return 200 with distinct raw HTML titles/canonicals; unknown GET returns 404 with the designed page.
- Live privacy: only the product origin was requested; cookies, localStorage, sessionStorage, and IndexedDB remained empty.
- Live mobile: first action and facts fit in 390 × 844, no horizontal overflow, and no interactive target is below 44 × 44 px.
- Live offline: service-worker-controlled reload passed; the clean-clone old-to-new cache replacement test also passed.
- Live headers: all ten cache and security checks passed.
- Live Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 2.09 s, CLS 0, TBT 52 ms, 228,779 transferred bytes.

Evidence is under `.factory/evidence/polish-1-live/`, `.factory/evidence/polish-1/`, and `.factory/evidence/claims.json`.

## Run and release

```bash
npm ci
npm test
npm run check
npm run test:claims
npm run test:claims:each
npm run check:pack
npm run check:smoke
npm run check:a11y
npm run check:headers
npm run check:offline
npm run check:pwa-update
npm run check:visual
npm run build
npm pack --dry-run
```

`npm run build` emits the package to `dist/package` and the static site to `dist/site`. The site ships the ready-to-install `headless-scheduler-0.1.0.tgz`. Registry publishing was intentionally not performed because factory credentials own that step; the site makes no registry claim and its displayed hosted-tarball command works in a fresh project.

## Remaining work

None for the reviewed release. All 11 review findings and UC-01 through UC-53 are closed and verified on the live deployment.
