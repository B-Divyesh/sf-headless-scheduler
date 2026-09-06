# Repair 8 handoff — PASS

Date: 2026-09-06
Work order: `headless-scheduler-repair-8`
Live URL: <https://headless-scheduler.sociobot.in>
Implementation SHA: `c4aa78ae557c349f5c9dff7f4fdad0980b4139b7`
Documentation and evidence SHA before this handoff: `b99d1af29c939facae990586b1cfd9f9130e8de1`

## Completed

- Fixed positive-offset month output. Month keys, day numbers, outside-month flags, today flags, and local-midnight instants now use the configured adapter and time zone.
- Added unit, claim, and clean installed-package regressions for `Asia/Kolkata` and `Pacific/Auckland`.
- Narrowed the browser privacy claim to user data. The site and README now disclose the same-origin static Cache Storage shell.
- Expanded the privacy claim test to inspect the exact static cache allowlist and prove that a unique demo edit is absent from every cached response.
- Removed the untestable security-response promise.
- Replaced the remaining 404 and dialog metaphors with “Page not found,” “This page does not exist,” and “New event.”
- Updated the copy audit, demo notes, changelog, claim registry, and repair evidence.
- Made the supplemental cold-browser audit select the dialog submit action unambiguously.
- Kept the catalog description verb-first and under 120 characters, with an identical copy at `/work/.evidence/catalog-description.txt`.

All findings from Review 4 are closed. The earlier package, service-worker update, timezone, pointer validation, resize feedback, keyboard resize, claims, routing, copy, accessibility, and privacy findings remain covered by current regression checks.

## Verification

Fresh clone: `/tmp/headless-scheduler-repair8-recheck.pMLI9C`

- `npm ci --ignore-scripts --no-audit --no-fund` — passed; 150 packages installed from the lockfile.
- `npm test` — passed, 32/32.
- `npm run check` — passed.
- `npm run build` — passed; created `dist/package` and `dist/site`.
- `npm run check:claims` — passed; 33 claims and 33 unique tags, one-to-one.
- `npm run test:claims:each` — all 33 declared claim commands passed independently.
- `npm run test:claims` — passed, 34/34 including the mobile interaction baseline.
- `npm run check:pack` — passed in a fresh ESM/CommonJS/React consumer, including native DST, positive-offset month, and pointer validation checks.
- `npm pack --dry-run` — passed; 24 files, 42.2 kB packed and 146.9 kB unpacked.
- Local `check:headers`, `check:offline`, `check:smoke`, `check:a11y`, and `check:pwa-update` — passed. Axe found zero violations on Home, Demo, Privacy, Terms, and 404.

## Live and deployment verification

- The durable static resource remains `sf-headless-scheduler` with one production custom domain. No backend, shared database, secret, staging slot, or payment resource was accessed or changed.
- The live page reports implementation marker `c4aa78a`. A build made with that marker matched live `index.html`, JavaScript, CSS, service worker, manifest, and v0.1.0 release file byte for byte.
- Live `check:headers`, `check:offline`, `check:smoke`, and `check:a11y` passed. All 34 live Playwright tests passed.
- Fresh 390 × 844 and 1440 × 900 browsers showed the job, audience, sample action, and three facts before scrolling.
- The one-click sample showed Studio A and Morning briefing with the persistent sample-data banner. Invalid input, correction, a 23:59 event, JSON editing, reset, and the designed 404 all passed. Reset restored the five-event seed.
- Cookies, localStorage, sessionStorage, and IndexedDB remained empty. The only allowed persistent browser storage was the disclosed same-origin static cache, and no demo edit appeared in it.
- The factory URL verifier passed with one H1, `lang=en`, a main landmark, complete image alternatives, labelled buttons, and zero console errors.
- All product, source, license, robots, sitemap, legal, and package links returned their intended status. The unknown route intentionally returned HTTP 404.
- Lighthouse mobile evidence from this repair: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 2.119 s, CLS 0, TBT 24 ms.
- Entry JavaScript is 55,640 bytes raw and 19,603 bytes gzip. CSS is 22,583 bytes raw and 5,702 bytes gzip. The hero WebP is 198,634 bytes.

The implementation was already deployed during this repair work. Later commits contain only reports, screenshots, and the corrected audit locator, so no replacement product image is required.

## Reproduce

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run check
npm run build
npm run check:claims
npm run test:claims:each
npm run test:claims
npm run check:pack
npm pack --dry-run
npm run check:smoke
npm run check:a11y
npm run check:headers
npm run check:offline
npm run check:pwa-update
npm run check:smoke -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:offline -- https://headless-scheduler.sociobot.in
```

## Remaining scope

No known defect remains in the reviewed v0.1 scope. The package is ready to publish, but npm publication belongs to the factory operator. Vue and Svelte adapters, recurrence expansion, iCal parsing, printing, and a hosted builder remain the brief's stated post-v1 work. This free static library has no backend, tenant state, paid offer, or external integration.
