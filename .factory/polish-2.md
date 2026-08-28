# Perfection loop round 2 — finding closure

Date: 2026-08-28

Reviewed release: `5e9933d4b3548a7b7fbaf2b069970af4bbec4087`

Repair commit: `980429e` (`polish release candidate findings`), pushed to `main` and deployed as the configured static artifact.

## Evidence key

- `CLAIMS`: `npm run test:claims` — 33 registered claim tests pass.
- `MATRIX`: `.factory/evidence/polish-2/claim-matrix-clean.json` — every claim is invoked separately from a clean clone.
- `BROWSER`: `.factory/evidence/polish-2/browser.json` and its four screenshots — 390 × 844 and 1440 × 900, routes, first screen, privacy, target-size, and overflow checks.
- `A11Y`: `npm run check:a11y` — zero axe violations on Home, Demo, Privacy, Terms, and 404.
- `PACKAGE`: `npm run check:pack` — fresh ESM, CommonJS, React, types, and CSS consumer.
- `LIVE`: `.factory/evidence/polish-2-live/browser.json`, `verify/verify.json`, and `axe.json` — cold deployed URL, route/title/404/mobile checks, factory URL verification, and zero axe violations on all route states.

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 / UC-21 | The test extracts the exact README scheduler fence, installs the hosted release in a temporary project, compiles it, runs it with `renderYourUI`, and asserts the moved event retains its duration. | `@claim:readme-example`; CLAIMS, MATRIX, LIVE claim suite |
| F-2-2 / UC-45 | The installed release now runs in a browser sandbox that traps fetch, XHR, WebSocket, EventSource, beacon, cookies, IndexedDB, Cache Storage, and both web stores while every public operation is exercised. | `@claim:package-side-effects`; CLAIMS, MATRIX |
| F-2-3 / UC-51 | Grid navigation now asserts each documented key at the first and last row and first and last cell, as well as an interior cell. | `@claim:grid-keyboard-navigation`; CLAIMS, MATRIX |
| F-2-4 / UC-15 | Offline verification now proves seeded Studio A and Morning briefing, changes views, edits an event offline, and confirms the resulting timeline event. | `@claim:offline-demo`; CLAIMS, MATRIX |
| F-2-5 / UC-01 / UC-05 / UC-14 | The hosted installed package manifest and full MIT license are inspected; a fresh consumer also creates each four supported view states. | `@claim:mit-license`; CLAIMS, MATRIX |
| F-2-6 | Removed the remaining jargon regression across the landing and README. | BROWSER screenshots; `.factory/copy-audit.md` |
| F-2-7 | Replaced “runtime dependencies in core” with “works without installing other packages” in documentation. | `.factory/copy-audit.md`; `@claim:zero-runtime-dependencies` |
| F-2-8 | Replaced “typed data” with “TypeScript objects.” | `.factory/copy-audit.md`; BROWSER home screenshot |
| F-2-9 | Replaced “view model” with “Calculate the calendar layout.” | `.factory/copy-audit.md`; BROWSER home screenshot |
| F-2-10 | Replaced “Tailwind tokens” and “data store” with Tailwind styles and choosing where to save data. | `.factory/copy-audit.md`; BROWSER home screenshot |
| F-2-11 | Replaced “clipped event positions” with an explanation of events crossing the visible range. | `.factory/copy-audit.md`; `@claim:resource-layout` |
| F-2-12 | Replaced “finite month window” with nearby months while scrolling. | `.factory/copy-audit.md`; `@claim:month-models` |
| F-2-13 | Replaced “recurring-event expansion” with a plain explanation of recurrence rules. | `.factory/copy-audit.md`; `@claim:recurrence-scope` |
| F-2-14 | Removed unlisted registry status and calls the download the v0.1.0 release file. | `.factory/copy-audit.md`; `@claim:release-package-installs` |
| F-2-15 | Replaced “typed API” with “Call five scheduling functions.” | `.factory/copy-audit.md`; BROWSER home screenshot |
| F-2-16 | Uses “demo” for the live trial throughout landing, README, and demo screen. | `.factory/copy-audit.md`; `@claim:package-playground` |
| F-2-17 | Uses “v0.1.0 release file” in prose and only shows `.tgz` in the technical install command. | `.factory/copy-audit.md`; `@claim:release-package-installs` |
| F-2-18 | Rewrote the download sentence in plain JavaScript, TypeScript, CSS, and React terms. | `.factory/copy-audit.md`; `@claim:package-formats` |
| F-2-19 | Rewrote date instructions with a complete ISO-date example. | `.factory/copy-audit.md`; `@claim:date-adapters`, `@claim:iso-event-boundary` |
| F-2-20 | Rewrote preset-CSS instructions without internal styling terms. | `.factory/copy-audit.md`; `@claim:preset-css` |
| F-2-21 | Rewrote privacy copy as no third-party files. | `.factory/copy-audit.md`; `@claim:privacy-boundary` |
| F-2-22 | “Start for real — install the package” now links to `/#install`. | `@claim:demo-isolation-reset`; BROWSER demo screenshot |
| F-2-23 | The dialog action now says “Close without adding.” | BROWSER demo screenshot; `mobile controls, dialog focus, and validation meet the interaction baseline` |
| F-2-24 | Privacy is a persistent primary-header link; mobile preserves Demo and Privacy while API and Install collapse. | `@claim:route-contract`; BROWSER mobile screenshot |
| F-2-25 | The first screen now states “Free to use under MIT,” demo isolation, and offline-after-first-visit. | BROWSER first-screen assertions; `@claim:mit-license`, `@claim:demo-isolation-reset`, `@claim:offline-demo` |
| F-2-26 | Removed the untested npm-registry availability sentence; installation names only the tested release file. | `.factory/copy-audit.md`; `@claim:release-package-installs` |
| F-2-27 | Added the registered `sample-seed` claim and fresh-demo test for rooms, people, and scheduled work. | `@claim:sample-seed`; CLAIMS, MATRIX |
| F-2-28 | Added `SECURITY.md` with the private `security@sociobot.in` reporting address and linked it from the README. | `SECURITY.md`; package/link crawl in final live check |

## Earlier review coverage

Review 1’s numbered findings 1–11 remain closed by the same production paths: fresh install (`release-package-installs`), one-click demo (`demo-isolation-reset`), one-to-one claims (`check:claims`), real routes (`route-contract`), metadata/focus (`route-contract`), copy audit, landing structure screenshots, mobile target audit, and route title assertion.

All `UC-01` through `UC-53` remain covered by their named claim tests from round 1. The only reopened IDs were UC-01, UC-05, UC-14, UC-15, UC-21, UC-45, and UC-51; their stronger replacement evidence is mapped above. No earlier finding is deferred.

## Additional acceptance checks

- `npm test`: 29/29 unit tests pass.
- `npm run check`, `npm run build`, `npm run check:pack`, `npm run check:smoke`, `npm run check:a11y`, `npm run check:offline`, `npm run check:pwa-update`, and `npm run check:headers` pass.
- `BROWSER` reports no console errors, horizontal overflow, undersized targets, cookies, local/session storage, IndexedDB databases, or third-party origins.
- Cold live recheck after deployment repeated the same route, first-screen, isolated-demo, metadata, title, 404, privacy, target-size, and console checks at `https://headless-scheduler.sociobot.in`; all passed in `LIVE`.
