# Review 1 handoff — FAIL

Date: 2026-08-28
Work order: `headless-scheduler-review-1`
Reviewed base: `454a333f14d294fb073ced6fb723d1358152f5a4`
Live URL: <https://headless-scheduler.sociobot.in>

## What was done

Completed the requested adversarial first-read review at 390 × 844 and 1440 × 900 without changing product code. The full report is `.factory/review-1.md`.

Verdict: **FAIL** with five blocking findings:

1. `npm install headless-scheduler` fails in a clean temporary directory with npm E404.
2. The first screen does not name the audience or one correct first action.
3. The required sandboxed, published-package library demo does not exist.
4. `.factory/claims.json` and all `@claim:*` tests are absent.
5. `/demo` and unknown routes render the homepage; there is no designed 404.

The report also records incomplete metadata/legal skeleton, missing focus management, copy and terminology problems, missing standard landing sections, undersized mobile targets, and a 64-character home title.

## How to verify

Audit artifacts:

- `.factory/evidence/review-1-browser-audit.mjs` — fresh-context cold load, demo edit/reset observation, storage/network capture, route metadata, history focus, offline reload, axe, and touch-target measurement.
- `.factory/evidence/review-1-browser.json` — structured results.
- `.factory/evidence/review-1-mobile-cold.png` and `review-1-desktop-cold.png` — unscrolled first screens.
- `.factory/evidence/review-1-demo.png` — embedded example after entry.
- `.factory/evidence/review-1-axe-live.json` — live axe result.
- `.factory/evidence/review-1-verify/` — worker `verify-url.sh` output and screenshots.
- `.factory/evidence/review-1-copy-count.mjs` — reproducible landing/README word counts.

Commands exercised:

- `npm ci`
- `npm test` — 28/28 passed
- `npm run check` — passed
- `npm run build` — passed and produced `dist/`
- `npm run check:pack` — passed for the local tarball
- `npm run check:smoke` — passed at both target viewports
- `node scripts/a11y.mjs https://headless-scheduler.sociobot.in .factory/evidence/review-1-axe-live.json` — zero violations
- `/opt/fleet/lib/verify-url.sh https://headless-scheduler.sociobot.in .factory/evidence/review-1-verify` — passed its basic checks
- `npm run check:offline` and the live offline check — passed
- `npm run check:pwa-update` — passed
- `npm run check:headers` — passed
- clean temporary `npm install headless-scheduler` — failed with E404, exit 1

The rendered link crawl found no dead links. The live example made only same-origin requests, wrote no cookies/localStorage/sessionStorage/IndexedDB, reset an added event on reload, and reloaded through its service worker while offline. The visual identity is distinct and matches `.factory/design.md`.

## Known gaps and next steps

No fixes were made because this work order is review-only. Before another review:

1. Publish the npm package or remove the public install claim until publication is complete.
2. Implement a real `/demo` package playground with sample data, banner, Reset, Start for real, isolation, and `.factory/demo.md`.
3. Add `.factory/claims.json` and one exact `@claim:<id>` test for every retained claim.
4. Rewrite the hero and actions using the concrete copy in the report.
5. Add real route handling, a designed 404, focus/announcement behavior, complete route metadata, and consistent legal-page chrome.
6. Fix the six undersized mobile hit areas and rerun the full audit.
