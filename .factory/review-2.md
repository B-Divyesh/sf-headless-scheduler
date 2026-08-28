# Adversarial first-read review 2 — FAIL

Date: 2026-08-28

Live URL: <https://headless-scheduler.sociobot.in>

Reviewed commit: `5e9933d4b3548a7b7fbaf2b069970af4bbec4087`

Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context

## Verdict

**FAIL.** Five registered claims remain incompletely tested, one earlier copy finding has regressed, and there are additional copy, navigation, and claim-listing findings. A PASS requires zero findings and no untested claim.

The live product is materially improved: the first screen is clear, the one-click demo shows realistic data, demo edits remain isolated, the hosted package installs, all routes and crawled links resolve as intended, and axe reports zero violations. Those passes do not close the gaps below.

## Findings

### Blocking

#### F-2-1 — `readme-example` passes without running the README example (reopens `UC-21`)

- Exact claim: README line 47, “The `@claim:readme-example` test runs this example.”
- Test location: `tests/claims.spec.ts:78-82`.
- Evidence: the test constructs a shorter, hard-coded scheduler fixture from `../src`. It does not extract, compile, or execute the README code block, including its callback and subscription.
- Why this matters: the displayed example can drift or stop compiling while the claim remains green.
- Concrete fix: extract the fenced block into a generated consumer file, install the release tarball in a temporary project, compile it, execute it with a `renderYourUI` stub, and assert the move preserves duration.

#### F-2-2 — `package-side-effects` does not cover its privacy promise (reopens `UC-45`)

- Exact claim: “The core package makes no network or browser-storage calls; the application controls persistence.”
- Test location: `tests/claims.spec.ts:297-314`.
- Evidence: the test traps only `fetch`, `localStorage`, and `sessionStorage`. It does not trap `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`, IndexedDB, Cache Storage, or cookie writes. Round 1 explicitly required these channels; `.factory/polish-1.md` says they were instrumented, but the code does not do so.
- Why this matters: the strongest privacy sentence can regress through an unobserved API while the registered test stays green.
- Concrete fix: run the installed tarball in a browser-like sandbox with every network and persistent-storage channel instrumented, exercise all public operations, and assert zero calls.

#### F-2-3 — `grid-keyboard-navigation` never tests a boundary (reopens `UC-51`)

- Exact claim: “Grid navigation maps Arrow, Home, End, Page Up, and Page Down keys to bounded cells.”
- Test location: `tests/claims.spec.ts:190-194`.
- Evidence: every case starts at cell 10 in a 42-cell grid. No key is pressed at the first row, last row, first cell, or last cell.
- Why this matters: “bounded” is the behavior most likely to fail at an edge, yet the test exercises only an interior cell.
- Concrete fix: add first/last-row and first/last-cell cases for every directional and paging key to the same tagged test.

#### F-2-4 — `offline-demo` proves the shell, not the sample demo (reopens `UC-15`)

- Exact claim: “The service worker caches local pages and assets so the sample demo opens offline after its first visit.”
- Test location: `tests/claims.spec.ts:325-339`.
- Evidence: after offline reload, the test asserts only the H1 and demo banner. It never asserts a seeded event, a resource, a view model, or an offline edit.
- Why this matters: an empty or non-functional shell would satisfy the test.
- Concrete fix: after offline reload, assert “Morning briefing” and “Studio A,” switch views, add or edit an event, and confirm the live result.

#### F-2-5 — `mit-license` does not inspect the shipped package (reopens `UC-01`, `UC-05`, and `UC-14`)

- Exact claim: “The package and all four views are MIT licensed.”
- Test location: `tests/claims.spec.ts:58-63`.
- Evidence: the test reads the repository manifest and `LICENSE`, then checks only that the release tarball is larger than 1,000 bytes. It never extracts the tarball or inspects its manifest and license.
- Why this matters: the shipped artifact could omit or change its licensing data while the test passes.
- Concrete fix: install or unpack the `.tgz`, assert the installed manifest says MIT, assert the installed `LICENSE` contains the full MIT text, and assert the four view exports remain present.

#### F-2-6 — landing copy still contains unexplained jargon and inconsistent terms (reopens review 1 finding 8)

- Exact locations: F-2-7 through F-2-17 below.
- Evidence: the old phrases are gone, but the live page introduces “view model,” “Tailwind tokens,” “clipped,” “finite month window,” “tarball,” and multiple names for the same demo and release artifact.
- Why this matters: a visitor can understand the hero but has to translate implementation vocabulary as soon as they continue.
- Concrete fix: apply the rewrites below and make `.factory/copy-audit.md` match the live page and README.

### Copy findings

#### F-2-7 — unexplained “runtime dependencies” and “core”

Quote: “No runtime dependencies in core.” Rewrite: “The core works without installing other packages.”

#### F-2-8 — unexplained “typed data”

Quote: “Pass people, rooms, dates, and times as typed data.” Rewrite: “Pass people, rooms, dates, and times as TypeScript objects.”

#### F-2-9 — unexplained “view model”

Quote: “Build a view model.” Rewrite: “Calculate the calendar layout.”

#### F-2-10 — unexplained “Tailwind tokens” and “data store”

Quote: “Use your own components, Tailwind tokens, and data store.” Rewrite: “Render it with your Tailwind styles and save data where you choose.”

#### F-2-11 — unexplained “clipped event positions”

Quote: “Calculate clipped event positions across people, rooms, tools, or tracks.” Rewrite: “Position events across people, rooms, tools, or tracks, including events that cross the visible time range.”

#### F-2-12 — unexplained “finite month window”

Quote: “Build a finite month window as the reader scrolls.” Rewrite: “Render only the nearby months as someone scrolls.”

#### F-2-13 — unexplained “recurring-event expansion”

Quote: “The package does not provide storage, accounts, payments, or recurring-event expansion.” Rewrite: “The package does not store data, manage accounts or payments, or create repeated events from recurrence rules.”

#### F-2-14 — “tarball” and “registry publication” obscure the install state

Quote: “Use the hosted v0.1.0 tarball until registry publication.” Rewrite: “Install the v0.1.0 release file from this site. It is not on npm yet.”

#### F-2-15 — “typed API” is an abstract heading

Quote: “Use the typed API.” Rewrite: “Call five scheduling functions.”

#### F-2-16 — the demo has three names

Locations: landing “Package playground” and “Open the sample schedule”; README “isolated sample playground” and “reset the demo.” Use “demo” everywhere: “Open the demo,” “The demo opens with…,” and “Package demo.”

#### F-2-17 — the downloadable artifact has four names

Locations: landing “Versioned release file,” “scheduler package,” and “tarball”; README “release file,” “package file,” and “tarball.” Use “v0.1.0 release file” in prose and reserve “`.tgz` archive” for the one technical explanation.

#### F-2-18 — the README format sentence is acronym-heavy

Quote: “The tarball provides ESM, CommonJS, TypeScript declarations, optional React bindings, and the preset CSS file.” Rewrite: “The download supports JavaScript `import` and `require`, includes TypeScript types and CSS, and adds React support only when requested.”

#### F-2-19 — the README date instructions introduce six terms at once

Quote: “Use the built-in adapter, native Temporal, its polyfill, or supplied date-fns functions. Pass event dates as ISO strings with an offset or `Z`.” Rewrite: “Choose the built-in date handling, Temporal, or date-fns. Pass complete ISO dates such as `2026-08-27T09:00:00Z`.”

#### F-2-20 — the README styling sentence is needlessly internal

Quote: “Import `headless-scheduler/preset.css` or copy it into your Tailwind component layer. Override its `--hs-*` variables, or render different markup from the returned view data.” Rewrite: “Import the preset CSS or copy it into Tailwind. Change its `--hs-*` colors, or render your own HTML from the calendar data.”

#### F-2-21 — “runtime CDNs” is unexplained privacy jargon

Quote: “The documentation site uses no analytics, accounts, cookies, local storage, third-party scripts, remote fonts, or runtime CDNs.” Rewrite: “The documentation site does not load scripts, fonts, or other files from third-party sites.” Keep storage in a separate sentence.

#### F-2-22 — “Start for real” does not name the next result

It links to `/`, at the top of the landing page. Link to `/#install` and label it “Start for real — install the package.”

#### F-2-23 — “Cancel” does not state what is discarded

Location: Add event dialog. Use “Close without adding.”

### Structure and claims-listing findings

#### F-2-24 — the shared header omits Privacy

- Exact header: “Demo · API · Install · GitHub.”
- Why this matters: the site-structure contract requires Privacy in the consistent header. On mobile, it is available only after scrolling to the footer.
- Fix: replace the header GitHub item with Privacy; Source remains in the footer.

#### F-2-25 — the first-screen facts omit offline and do not state price plainly

- Exact facts: “MIT licensed”; “No runtime dependencies in core”; “Demo edits stay in this tab.”
- Fix: “Free to use under MIT”; “Demo data stays in this tab”; “Demo works offline after the first visit.”

#### F-2-26 — npm availability is an unlisted claim

- Quote: README, “The npm registry name is not published yet.”
- Fix: publish the package and remove the sentence, or add a registry-availability claim that checks the exact package/version state.

#### F-2-27 — the stated sample contents are an unlisted claim

- Quote: landing, “The sample opens with rooms, people, and scheduled work.”
- Fix: add `@claim:sample-seed` that asserts room resources, person resources, and scheduled events in a fresh demo.

#### F-2-28 — the security-reporting instruction has no private route

- Quote: README, “Report security issues privately through the repository owner’s GitHub profile.”
- Fix: enable GitHub private vulnerability reporting and link its advisory form, or add a `SECURITY.md` with a specific private contact.

## 1. Cold first screen

Before scrolling, both fresh contexts answered all three questions:

| Question | 390 px | 1440 px | Result |
| --- | --- | --- | --- |
| What does it do? | Supplies calendar and resource-timeline behavior for interfaces. | Same. | Pass |
| For whom? | Product engineers who do not want another component library. | Same. | Pass |
| What should I click first? | “Try it with sample data,” visible at 451 px. | Same action, visible at 629 px. | Pass |

Exact first-screen copy:

> “Build calendar and resource timeline UIs”

> “For product engineers who need scheduling behavior without adopting another component library.”

> “Try it with sample data”

> “Opens an editable resource timeline in this page.”

The action and all three facts fit in 390 × 844. There was no horizontal overflow or console error. Evidence: `.factory/evidence/review-2-mobile-cold.png` and `.factory/evidence/review-2-desktop-cold.png`.

## 2. Copy audit

Counts treat a version, code symbol, or hyphenated term as one word. Code blocks are excluded. `J` = jargon, `T` = inconsistent term, `A` = action does not name its result, `C` = unlisted claim. No sentence exceeds 22 words, and no banned marketing adjective appears.

### Landing page

| Exact copy | Words | Result |
| --- | ---: | --- |
| UI not included | 3 | Pass for the named audience. |
| Build calendar and resource timeline UIs | 6 | Pass. |
| For product engineers who need scheduling behavior without adopting another component library. | 12 | Pass. |
| Try it with sample data | 5 | Pass. |
| Opens an editable resource timeline in this page. | 8 | Pass. |
| MIT licensed | 2 | Pass; listed claim. |
| No runtime dependencies in core | 5 | J — F-2-7. |
| Demo edits stay in this tab | 6 | Pass; listed claim. |
| You supply the interface. | 4 | Pass. |
| The package supplies scheduling logic. | 5 | Pass; listed claim. |
| Package playground | 2 | T — F-2-16. |
| See a staffed studio schedule | 5 | Pass. |
| The sample opens with rooms, people, and scheduled work. | 9 | C — F-2-27. |
| Open the sample schedule | 4 | T — F-2-16. |
| How it works | 3 | Pass. |
| Add scheduling behavior in three steps | 6 | Pass. |
| Define resources and events. | 4 | Pass. |
| Pass people, rooms, dates, and times as typed data. | 9 | J — F-2-8. |
| Build a view model. | 4 | J — F-2-9. |
| Choose day, week, continuous month, or resource timeline. | 8 | Pass; listed claim. |
| Render your interface. | 3 | Pass. |
| Use your own components, Tailwind tokens, and data store. | 9 | J — F-2-10. |
| Lay out resource timelines | 4 | Pass. |
| Calculate clipped event positions across people, rooms, tools, or tracks. | 10 | J — F-2-11. |
| Render nearby months | 3 | Pass. |
| Build a finite month window as the reader scrolls. | 9 | J — F-2-12. |
| Move events with input controls | 5 | Pass. |
| Create, move, and resize events with pointer or keyboard controls. | 10 | Pass; listed claims. |
| Scope and privacy | 3 | Pass. |
| You control data and rendering | 5 | Pass. |
| The package does not provide storage, accounts, payments, or recurring-event expansion. | 10 | J — F-2-13. |
| The documentation site does not load analytics, third-party scripts, or remote fonts. | 12 | Pass; listed claim. |
| Read the privacy details | 4 | Pass. |
| Versioned release file | 3 | T — F-2-17. |
| Install the scheduler package | 4 | T — F-2-17. |
| Use the hosted v0.1.0 tarball until registry publication. | 8 | J/T — F-2-14 and F-2-17. |
| Copy install command | 3 | Pass. |
| Core functions | 2 | Pass. |
| Use the typed API | 4 | J — F-2-15. |
| Read the API | 3 | Pass. |
| Scheduling logic for interfaces you design. | 6 | Pass. |

### README

| Exact copy | Words | Result |
| --- | ---: | --- |
| Headless Scheduler | 2 | Pass. |
| Headless Scheduler is a TypeScript scheduling library for booking, staffing, and planning interfaces. | 13 | Pass. |
| It supplies behavior and typed view data, not UI components. | 10 | Pass for the named audience. |
| Version 0.1.0 includes day, week, continuous month, and resource timeline models under the MIT license. | 15 | Pass; listed claims. |
| The core package has no runtime dependencies. | 7 | J — F-2-7. |
| A React adapter is optional. | 5 | Pass; listed claim. |
| Try the package | 3 | Pass. |
| Open the isolated sample playground. | 5 | T — F-2-16. |
| You can edit sample JSON, move or resize events, switch views, and reset the demo. | 14 | Pass; listed claims. |
| Demo edits stay in memory and clear on reload or reset. | 11 | Pass; listed claim. |
| Install the release file | 4 | T — F-2-17. |
| The npm registry name is not published yet. | 8 | C — F-2-26. |
| Install the versioned package file served by this release. | 9 | T — F-2-17. |
| The tarball provides ESM, CommonJS, TypeScript declarations, optional React bindings, and the preset CSS file. | 15 | J/T — F-2-17 and F-2-18. |
| Create a scheduler | 3 | Pass. |
| The `@claim:readme-example` test runs this example. | 6 | Misleading coverage — F-2-1. |
| Use React | 2 | Pass. |
| Handle pointer input | 3 | Pass. |
| Create, move, or resize interactions at fixed time intervals. | 9 | Pass; listed claim. |
| Use `getGridNavigation` to map Arrow, Home, End, Page Up, and Page Down keys to grid positions. | 16 | Coverage gap — F-2-3. |
| Choose date calculations | 3 | Pass. |
| Use the built-in adapter, native Temporal, its polyfill, or supplied date-fns functions. | 12 | J — F-2-19. |
| Pass event dates as ISO strings with an offset or `Z`. | 11 | J — F-2-19. |
| Version 0.1 does not expand recurring events. | 8 | Pass; listed claim. |
| Expand them before passing events to the library. | 8 | Pass. |
| Style the example | 3 | Pass. |
| Import `headless-scheduler/preset.css` or copy it into your Tailwind component layer. | 10 | J — F-2-20. |
| Override its `--hs-*` variables, or render different markup from the returned view data. | 12 | J — F-2-20. |
| Public API | 2 | Pass. |
| `createScheduler` creates state and returns create, update, move, resize, and remove methods. | 12 | Pass; listed claim. |
| `buildMonth` and `getContinuousMonthWindow` calculate month data. | 6 | Pass; listed claim. |
| `buildTimeGrid`, `buildResourceTimeline`, and `layoutOverlaps` calculate event positions. | 7 | Pass; listed claim. |
| `createPointerInteraction` handles pointer create, move, and resize actions. | 8 | Pass; listed claim. |
| `getGridNavigation` maps keyboard input to grid positions. | 7 | Pass; listed claim. |
| Date adapters provide built-in, Temporal, or date-fns calculations. | 8 | Pass; listed claim. |
| `HeadlessScheduler` and `useScheduler` provide optional React bindings. | 7 | Pass; listed claim. |
| Develop, test, and deploy | 4 | Pass. |
| `npm run build` writes the package to `dist/package` and the static site to `dist/site`. | 12 | Pass; listed claim. |
| The site output includes the installable tarball and route files. | 10 | T — F-2-17; listed claim. |
| The documentation site uses no analytics, accounts, cookies, local storage, third-party scripts, remote fonts, or runtime CDNs. | 17 | J — F-2-21; listed claim. |
| The service worker uses Cache Storage for offline pages and assets. | 11 | Pass; listed claim. |
| The package includes no telemetry or network calls. | 8 | Coverage gap — F-2-2. |
| Applications choose how to store scheduler data. | 7 | Pass; listed claim. |
| Support and scope | 3 | Pass. |
| The package build targets ES2022 and pointer interactions use the Pointer Events API. | 13 | Pass as compatibility documentation; listed claim. |
| The release contains ESM and CommonJS builds plus declarations. | 9 | J — F-2-18; listed claim. |
| React 18 and 19 can use the optional adapter. | 10 | Pass; listed claim. |
| Vue and Svelte adapters, recurrence expansion, iCal parsing, printing, and a hosted builder are outside version 0.1. | 18 | Pass; listed claim. |
| Report security issues privately through the repository owner’s GitHub profile. | 10 | Actionability — F-2-28. |
| License | 1 | Pass. |
| MIT © 2026 Sociobot (Param Factory). | 5 | Pass. |
| See LICENSE. | 2 | Pass. |

Button audit: all controls have verb-led accessible names except “Start for real” (F-2-22) and “Cancel” (F-2-23). Day, Week, Month, and Timeline expose “Show … view” accessible names, so they pass.

## 3. Demo and sandbox

**Pass.** The hero action opens `/?demo=1` in one click. At 390 × 844, the first demo screen already contains the banner, resource timeline controls, Studio A, and Morning briefing.

- Seed: four resources and five events; four are visible in the initial one-day timeline.
- Edit: adding “Audit visit” changed the live timeline.
- Reset and reload removed the edit.
- Storage before and after: no cookies, localStorage, sessionStorage, or IndexedDB.
- Requests: only `https://headless-scheduler.sociobot.in`.
- Offline: after one visit, `/demo` reloaded offline and an “Offline planning” event could be added.

Evidence: `.factory/evidence/review-2-demo-mobile.png`. F-2-4 remains because the registered automation does not prove the behavior independently.

## 4. Claims

All 32 commands were invoked independently after `npm ci` and `npm run build` in a clean clone. Every process exited 0. Five tests still fail the claim-contract adequacy check.

| Claim ID | Process | Coverage |
| --- | --- | --- |
| release-package-installs | PASS | Adequate; live tarball also installed and ran as v0.1.0. |
| package-formats | PASS | Adequate. |
| typescript-declarations | PASS | Adequate. |
| mit-license | PASS | **Incomplete — F-2-5.** |
| zero-runtime-dependencies | PASS | Adequate. |
| package-playground | PASS | Adequate. |
| readme-example | PASS | **Incomplete — F-2-1.** |
| scheduler-operations | PASS | Adequate. |
| resource-layout | PASS | Adequate. |
| collision-layout | PASS | Adequate. |
| month-models | PASS | Adequate. |
| four-demo-views | PASS | Adequate. |
| shared-demo-state | PASS | Adequate. |
| demo-isolation-reset | PASS | Adequate. |
| pointer-modes | PASS | Adequate. |
| pointer-capture-validation | PASS | Adequate for registered wording. |
| grid-keyboard-navigation | PASS | **Incomplete — F-2-3.** |
| keyboard-controls | PASS | Adequate. |
| iso-event-boundary | PASS | Adequate. |
| timezone-boundaries | PASS | Adequate. |
| date-adapters | PASS | Adequate. |
| recurrence-scope | PASS | Adequate. |
| release-scope | PASS | Adequate. |
| browser-primitives | PASS | Adequate. |
| preset-css | PASS | Adequate. |
| react-adapter | PASS | Adequate. |
| privacy-boundary | PASS | Adequate for the site claim. |
| package-side-effects | PASS | **Incomplete — F-2-2.** |
| headless-core | PASS | Adequate. |
| offline-demo | PASS | **Incomplete — F-2-4.** |
| route-contract | PASS | Adequate. |
| static-site-artifact | PASS | Adequate. |

Unlisted claim scan found F-2-26 and F-2-27. Therefore there are untested claims despite the exact 32-to-32 tag mapping.

## 5. Earlier-finding verification

### Review 1 top-level findings

| Earlier finding | Current result |
| --- | --- |
| 1 — advertised install failed | Fixed: live `.tgz` installed and executed in a new project. |
| 2 — first screen unclear | Fixed: cold mobile and desktop checks pass. |
| 3 — no contract demo | Fixed: live demo/reset/isolation checks pass. |
| 4 — claims registry absent | Fixed structurally; adequacy gaps are F-2-1 through F-2-5. |
| 5 — routing broken | Fixed: intended routes return 200 and unknown route returns designed 404. |
| 6 — route metadata/skeleton incomplete | Fixed: metadata, header, footer, legal links, and art verified. |
| 7 — route focus/announcement absent | Fixed: H1 and announcer update after forward/back navigation. |
| 8 — jargon and inconsistent terms | **Regressed — F-2-6.** |
| 9 — landing structure incomplete | Fixed: preview, three steps, scope/privacy, install, and footer are present. |
| 10 — undersized mobile targets | Fixed: zero targets below 44 × 44 on all route states. |
| 11 — title too long/marketing | Fixed: home title is 49 characters and job-descriptive. |

### Review 1 `UC-*` findings

| ID | Current result |
| --- | --- |
| UC-01 | **Reopened by F-2-5.** |
| UC-02 | Fixed by resource, month, pointer, and view claims. |
| UC-03 | Fixed by dependency metadata check. |
| UC-04 | Fixed by named four-view browser test. |
| UC-05 | **Reopened by F-2-5.** |
| UC-06 | Fixed by package alias/version demo check. |
| UC-07 | Fixed by edited cross-view state test. |
| UC-08 | Fixed by split operation/layout/input/navigation claims. |
| UC-09 | Fixed; unbounded wording removed. |
| UC-10 | Fixed by clipped percentage assertion. |
| UC-11 | Fixed by finite window assertion. |
| UC-12 | Fixed by input and announcement tests. |
| UC-13 | Fixed by clean package consumers. |
| UC-14 | **Reopened by F-2-5; privacy and scope parts remain covered.** |
| UC-15 | **Reopened by F-2-4.** |
| UC-16 | Fixed by format, type, React, and dependency tests. |
| UC-17 | Fixed except the exact-example issue under UC-21/F-2-1. |
| UC-18 | Fixed by resource/month/headless claims. |
| UC-19 | Fixed by optional peer and React 18/19 tests. |
| UC-20 | Fixed by adapter runtime and package export tests. |
| UC-21 | **Reopened by F-2-1.** |
| UC-22 | Fixed by all four pointer modes. |
| UC-23 | Fixed by finite/zero/negative/NaN/infinity validation. |
| UC-24 | Fixed for narrowed wording: capture and snapped commit are asserted. |
| UC-25 | Fixed for documented keys and live announcements; boundary gap is UC-51/F-2-3. |
| UC-26 | Fixed by accepted/rejected ISO values. |
| UC-27 | Fixed after copy narrowed to configured day boundaries. |
| UC-28 | Fixed after stronger direct-call copy was removed; DST boundaries are tested. |
| UC-29 | Fixed after parity wording was removed; both adapters are exercised. |
| UC-30 | Fixed by recurrence-scope test. |
| UC-31 | Fixed by installed CSS and computed override. |
| UC-32 | Fixed; “stable” removed and headless/CSS behavior tested. |
| UC-33 | Fixed by strict TypeScript consumer. |
| UC-34 | Fixed by demo route/version checks. |
| UC-35 | Fixed by installed package targets and runtime imports. |
| UC-36 | Fixed by serving only `dist/site`. |
| UC-37 | Fixed by request/storage interception. |
| UC-38 | Fixed by removing the container/UID claim. |
| UC-39 | Fixed by live headers, route responses, and artifact checks. |
| UC-40 | Fixed by explicit ES2022/Pointer Events wording and test. |
| UC-41 | Fixed by ESM and CommonJS consumers. |
| UC-42 | Fixed by removing Vue/Svelte compatibility and testing React/headless core. |
| UC-43 | Fixed by site privacy interception. |
| UC-44 | Fixed by reset/reload/exit and empty storage checks. |
| UC-45 | **Reopened by F-2-2.** |
| UC-46 | Fixed by headless and immutable-operation tests; breadth gap is F-2-2. |
| UC-47 | Fixed by operation and immutability test. |
| UC-48 | Fixed by month/window assertions. |
| UC-49 | Fixed by resource and collision layout assertions. |
| UC-50 | Fixed by all pointer modes and snapping. |
| UC-51 | **Reopened by F-2-3.** |
| UC-52 | Fixed by built-in, Temporal, and supplied date-function tests. |
| UC-53 | Fixed by React 18/19 installed consumers. |

## 6. Structure, links, identity, and accessibility

Passes:

- All route titles, descriptions, canonicals, OG/Twitter metadata, favicons, H1s, main landmarks, shared chrome, and the designed 404 were verified live.
- Forward and Back move focus to the new H1 and update the live announcement.
- All internal and GitHub destinations resolved; `robots.txt` and `sitemap.xml` list public routes.
- Live responses include CSP, HSTS, content-type, referrer, frame, opener, resource, permissions, and cache policies.
- No console errors; axe found zero violations on Home, Demo, Privacy, Terms, and 404.
- All visible controls are at least 44 × 44 CSS pixels at 390 px; no page-level horizontal overflow.
- Reduced-motion routing is implemented.
- The paper, tomato/cobalt ink, offset print marks, editorial type, and collage form a distinct product identity.
- Built JavaScript is 19.50 kB gzip.

Failure: F-2-24, because Privacy is absent from the shared header.

Evidence: `.factory/evidence/review-2-verify/verify.json` and `.factory/evidence/review-2-axe-live.json`.

## 7. Missed leverage

No AI feature is justified for deterministic calendar layout and input primitives. Adding one would be decorative. iCal parsing, recurrence expansion, printing, and hosted building are explicitly outside version 0.1. The distribution gap is already stated honestly and tracked as F-2-26.

## 8. Verification commands and results

| Check | Result |
| --- | --- |
| Clean clone `npm ci --ignore-scripts --no-audit --no-fund` | PASS |
| Clean clone `npm run build` | PASS; `dist/package` and `dist/site` created |
| Clean clone `npm run check:claims` | PASS; 32 claims, 32 unique tags |
| Clean clone `npm run test:claims:each` | 32/32 process PASS; five adequacy failures above |
| Clean clone `npm test` | PASS; 29/29 |
| Clean clone `npm run check` | PASS |
| Live release install in a new npm project | PASS; version 0.1.0 |
| `/opt/fleet/lib/verify-url.sh` | PASS |
| Live axe on five route states | PASS; zero violations |
| Live offline reload and edit | PASS |
| Live route/link crawl | PASS except structural F-2-24 |

## What would make this perfect

1. Make the five tagged tests prove the exact promises in F-2-1 through F-2-5.
2. Replace or define every flagged term and use one name for the demo and release file.
3. Send “Start for real” to install, make Cancel explicit, and put Privacy in the header.
4. Replace the first-screen dependency fact with the tested offline fact and state “Free” plainly.
5. Register the npm-availability and realistic-sample claims, or remove those sentences.
6. Provide an actual private security-reporting route.
7. Re-run the entire review from a fresh context and clean clone; PASS only with zero findings.
