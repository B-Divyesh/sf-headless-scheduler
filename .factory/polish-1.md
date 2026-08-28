# Perfection loop round 1 — finding closure

Date: 2026-08-28
Review: `.factory/review-1.md` at `31d62e1fe21ca9c8a7dbe63f94589fad29cf8629`
Release commit: `9dd9b8147b21e0d6330d7c768fc9e3447d84d431`
Live URL: <https://headless-scheduler.sociobot.in>

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files existed. Every numbered and `UC-*` finding from review 1 is closed below.

## Shared evidence

- `LIVE`: `.factory/evidence/polish-1-live/browser.json` — cold 390 × 844 and 1440 × 900 checks, first-screen fit, raw route status/title/canonical checks, same-origin requests, empty storage, zero undersized targets, and zero console errors.
- `SHOTS`: `.factory/evidence/polish-1-live/home-mobile.png`, `home-desktop.png`, `demo-mobile.png`, and `demo-desktop.png`.
- `AXE`: `.factory/evidence/polish-1-live/axe.json` — zero violations on Home, Demo, Privacy, Terms, and 404.
- `CLAIMS`: `.factory/evidence/claims.json` — 33/33 tests passed against the live URL; 32 are the exact one-to-one claim tests.
- `MATRIX`: `.factory/evidence/polish-1/claim-matrix-clean.json` — all 32 claim tests passed separately after a fresh clone and install.
- `LH`: `.factory/evidence/polish-1-live/lighthouse.json` — 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 2.09 s, CLS 0, TBT 52 ms.
- `VERIFY`: `.factory/evidence/polish-1-live/verify.json` — live title, language, H1, main, image alternatives, controls, and console check.

## Review findings

| ID | Change made | Evidence |
| --- | --- | --- |
| 1 | Replaced the unavailable registry command with the hosted, versioned v0.1.0 release tarball. The demo and README use the same tested command. | `@claim:release-package-installs`, `@claim:package-formats`; CLAIMS, MATRIX, LIVE `/headless-scheduler-0.1.0.tgz` |
| 2 | Rewrote the first screen to “Build calendar and resource timeline UIs,” named product engineers, made “Try it with sample data” the sole primary action, explained its result, and added three facts. | `@claim:four-demo-views`; SHOTS, LIVE first-screen flags |
| 3 | Added direct `/?demo=1` and `/demo` entry, realistic data, editable JSON-to-output playground, package version proof, sticky sandbox banner, Reset, and Start for real. | `@claim:package-playground`, `@claim:demo-isolation-reset`; SHOTS, LIVE |
| 4 | Added `.factory/claims.json`, exact one-to-one validation, and 32 independently runnable claim tests. | `npm run check:claims`; CLAIMS, MATRIX |
| 5 | Added real Home, Demo, Privacy, Terms, and styled 404 route responses; unknown GETs return 404. | `@claim:route-contract`, `@claim:static-site-artifact`; LIVE raw HTTP rows |
| 6 | Added route-specific title, description, canonical, Open Graph/Twitter data, social image, Apple icon, shared header/footer, legal links, version, and build ID. | `@claim:route-contract`; LIVE, VERIFY, SHOTS |
| 7 | Added History API navigation, back/forward restoration, H1 focus, route announcements, and dialog focus return. | `@claim:route-contract`; 33rd browser interaction test, AXE |
| 8 | Rewrote jargon, metaphors, long sentences, inconsistent license terms, and vague actions. Recorded the audited copy and terminology in `.factory/copy-audit.md`. | copy audit; SHOTS, VERIFY |
| 9 | Added “How it works” in three steps and a direct limits/privacy section in the required order. | SHOTS, LIVE home screenshots |
| 10 | Increased all interactive hit areas to at least 44 × 44 CSS pixels, including wordmark, GitHub, copy, and legal links. | LIVE `undersizedTargets: []`; SHOTS |
| 11 | Changed the home title to the 49-character plain title “Headless Scheduler — calendar and timeline logic.” | `@claim:route-contract`; LIVE, VERIFY |

## Unlisted-claim findings

| ID | Change made | Evidence |
| --- | --- | --- |
| UC-01 | Replaced “No premium views” with the precise MIT statement. | `@claim:mit-license`; CLAIMS, MATRIX |
| UC-02 | Split the bundled feature statement into named resource, month, pointer, and view claims. | `@claim:resource-layout`, `@claim:month-models`, `@claim:pointer-modes`, `@claim:four-demo-views`; CLAIMS |
| UC-03 | Kept the exact zero-runtime-dependency statement and inspected the installed package tree. | `@claim:zero-runtime-dependencies`; CLAIMS, MATRIX |
| UC-04 | Removed “useful” and named day, week, continuous month, and timeline. | `@claim:four-demo-views`; SHOTS, CLAIMS |
| UC-05 | Removed “forever”; the package and views now state only MIT licensing. | `@claim:mit-license`; CLAIMS |
| UC-06 | The playground imports the built package and displays the exact `PACKAGE_VERSION`. | `@claim:package-playground`; SHOTS, LIVE |
| UC-07 | One edited event is asserted across timeline and day views. | `@claim:shared-demo-state`; CLAIMS |
| UC-08 | Split and proved immutable operations, date boundaries, overlaps, pointer input, and keyboard navigation. | `@claim:scheduler-operations`, `@claim:collision-layout`, `@claim:pointer-modes`, `@claim:grid-keyboard-navigation`; CLAIMS |
| UC-09 | Removed the unbounded “any number” wording and test representative hour/day resource layouts. | `@claim:resource-layout`; CLAIMS |
| UC-10 | Assert clipped event positions and percentage output. | `@claim:resource-layout`; CLAIMS |
| UC-11 | Replaced “endless/practical” with finite nearby-month wording and assert window size. | `@claim:month-models`; CLAIMS |
| UC-12 | Proved pointer capture, snapping, all resize modes, keyboard movement, and live announcements. | `@claim:pointer-capture-validation`, `@claim:pointer-modes`, `@claim:keyboard-controls`; CLAIMS |
| UC-13 | Install and exercise ESM, CJS, declarations, React, and a zero-dependency core from the release tarball. | `@claim:package-formats`, `@claim:typescript-declarations`, `@claim:react-adapter`, `@claim:zero-runtime-dependencies`; MATRIX |
| UC-14 | Split MIT, telemetry/privacy, and included-view statements into independently tested claims. | `@claim:mit-license`, `@claim:privacy-boundary`, `@claim:release-scope`; CLAIMS |
| UC-15 | Clarified in-memory lifetime and proved first-visit caching, offline use, mutation, and reload reset. | `@claim:offline-demo`, `@claim:demo-isolation-reset`; CLAIMS, LIVE |
| UC-16 | Rewrote the release line and prove core independence, React option, formats, declarations, and dependencies. | `@claim:headless-core`, `@claim:react-adapter`, `@claim:package-formats`, `@claim:typescript-declarations`, `@claim:zero-runtime-dependencies`; MATRIX |
| UC-17 | Rewrote the introduction in plain words and prove MIT, TypeScript declarations, and the documented example. | `@claim:mit-license`, `@claim:typescript-declarations`, `@claim:readme-example`; MATRIX |
| UC-18 | Narrowed the wording and prove resource/month models plus a core import without DOM or React. | `@claim:resource-layout`, `@claim:month-models`, `@claim:headless-core`; CLAIMS |
| UC-19 | Prove the core installs without React and the adapter renders with React 18 and 19. | `@claim:zero-runtime-dependencies`, `@claim:react-adapter`; MATRIX |
| UC-20 | Exercise native Temporal, polyfill Temporal, and supplied date-fns operations against shared fixtures. | `@claim:date-adapters`; MATRIX |
| UC-21 | Compile and run the exact README example. | `@claim:readme-example`; MATRIX |
| UC-22 | Commit create, move, resize-start, and resize-end interactions. | `@claim:pointer-modes`; MATRIX |
| UC-23 | Assert zero, negative, infinite, and NaN interaction settings fail. | `@claim:pointer-capture-validation`; MATRIX |
| UC-24 | Assert pointer capture occurs and the drag commits after moving beyond the origin. | `@claim:pointer-capture-validation`; MATRIX |
| UC-25 | Test every documented grid key and the browser move/resize announcements. | `@claim:grid-keyboard-navigation`, `@claim:keyboard-controls`; CLAIMS |
| UC-26 | Enforce complete ISO instants with seconds and `Z` or offset across create, update, move, and resize. | `@claim:iso-event-boundary`; MATRIX |
| UC-27 | Assert labels and day boundaries in DST and non-DST zones. | `@claim:timezone-boundaries`; MATRIX |
| UC-28 | Assert both DST transitions and direct date-add calls. | `@claim:timezone-boundaries`; MATRIX |
| UC-29 | Run equivalent native and Temporal boundary fixtures. | `@claim:date-adapters`; MATRIX |
| UC-30 | State recurrence expansion as out of scope and assert recurrence-like fields are not expanded. | `@claim:recurrence-scope`; MATRIX |
| UC-31 | Install the release CSS, override `--hs-accent`, and assert the computed event color. | `@claim:preset-css`, `@claim:release-package-installs`; CLAIMS |
| UC-32 | Replaced “stable” with a versioned v0.1 contract and prove CSS hooks plus DOM-free core import. | `@claim:preset-css`, `@claim:headless-core`; CLAIMS |
| UC-33 | Compile a strict NodeNext consumer against all declarations and subpath exports. | `@claim:typescript-declarations`; MATRIX |
| UC-34 | Named the API reference, made the demo package-backed, and assert its route/version. | `@claim:package-playground`, `@claim:route-contract`; LIVE, CLAIMS |
| UC-35 | Build through prepack, inspect every export, and import/require the installed tarball. | `@claim:package-formats`, `@claim:release-package-installs`; MATRIX |
| UC-36 | Serve only `dist/site`; assert routes, service worker, release file, and offline reload. | `@claim:static-site-artifact`, `@claim:offline-demo`, `@claim:route-contract`; LIVE |
| UC-37 | Clarified Cache Storage and prove no analytics, third-party origins, cookies, local/session storage, or IndexedDB. | `@claim:privacy-boundary`; LIVE, CLAIMS |
| UC-38 | Removed the unproved container/UID/port claim; static deployment instructions now describe only emitted artifacts. | `@claim:static-site-artifact`; LIVE |
| UC-39 | Split runtime wording and test HTML/assets/worker/manifest caches, 404 behavior, and ten security headers. | `@claim:route-contract`, `@claim:static-site-artifact`; LIVE; `npm run check:headers` |
| UC-40 | Replaced “evergreen” with the explicit ES2022 and Pointer Events requirement and test both primitives. | `@claim:browser-primitives`; MATRIX |
| UC-41 | Install and import ESM and require CommonJS from the release tarball. | `@claim:package-formats`; MATRIX |
| UC-42 | Removed the unproved Vue/Svelte compatibility statement; the page now says adapters are outside v0.1. React 18/19 and DOM-free core are tested. | `@claim:release-scope`, `@claim:react-adapter`, `@claim:headless-core`; CLAIMS |
| UC-43 | Intercept the complete demo flow and inspect every requested origin and browser storage surface. | `@claim:privacy-boundary`; LIVE, CLAIMS |
| UC-44 | Prove edit, reset, reload, and exit all restore the five-event seed without persistent app storage. | `@claim:demo-isolation-reset`; SHOTS, CLAIMS |
| UC-45 | Instrument fetch, XHR, WebSocket, beacon, local/session storage, and IndexedDB while exercising package operations. | `@claim:package-side-effects`; MATRIX |
| UC-46 | Prove the core works without DOM globals and returns immutable state without storage writes. | `@claim:headless-core`, `@claim:scheduler-operations`, `@claim:package-side-effects`; MATRIX |
| UC-47 | Exercise create, update, move, resize, remove, subscription, and prior-state immutability. | `@claim:scheduler-operations`; MATRIX |
| UC-48 | Assert month boundaries and finite continuous-month windows. | `@claim:month-models`; MATRIX |
| UC-49 | Assert time-grid, resource-row, overlap columns, clipping, and percentages. | `@claim:resource-layout`, `@claim:collision-layout`; MATRIX |
| UC-50 | Exercise every pointer mode with snapped preview and commit values. | `@claim:pointer-modes`, `@claim:pointer-capture-validation`; MATRIX |
| UC-51 | Assert Arrow, Home, End, PageUp, and PageDown behavior at middle and boundaries. | `@claim:grid-keyboard-navigation`; MATRIX |
| UC-52 | Run native, Temporal, polyfill, and injected date-fns calculations. | `@claim:date-adapters`; MATRIX |
| UC-53 | Install with React 18.3.1 and 19.1.0 and render the component and hook exports. | `@claim:react-adapter`; MATRIX |

## Final live recheck

The final deployment is build `9dd9b81` (deployment `e875abba-12bd-49e0-be42-d0caf76cb7a2`). A no-cache request returned that build marker. Cold live checks then passed the factory URL verifier, 33/33 Playwright checks, axe on five route states, both browser viewports, all interaction smoke checks, offline reload, ten header checks, same-origin privacy inspection, zero persistent storage, and a true GET 404 for an unknown route.
