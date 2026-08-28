# Adversarial first-read review 3 — PASS

Date: 2026-08-28
Live URL: <https://headless-scheduler.sociobot.in>
Reviewed repository commit: `ef765e8ad574758948ff9fdebdf17c727b1c22af`

## Verdict

**PASS.** No blocking, major, minor, copy, unlisted-claim, demo, routing, or accessibility finding remains. All 33 registered claims were executed separately from a fresh clone and passed. This is a pass rather than a deferral: the cold first screen, real package playground, isolated sample state, offline behavior, real routes, package artifact, and prior review repairs were exercised again in this round.

## 1. Cold first screen

Fresh Chromium contexts at 390 × 844 and 1440 × 900 loaded the live URL with cache disabled for the context. Before scrolling, the answer was the same at both sizes:

| Question | First-read answer | Result |
| --- | --- | --- |
| What does this do? | It provides calendar and resource-timeline behavior for a developer’s own interface. | Pass |
| For whom? | Product engineers who want scheduling behavior without taking on another component library. | Pass |
| What should I click first? | **Try it with sample data** to open an editable resource timeline. | Pass |

The exact first-screen copy is clear and within the plain-words limits:

> “Build calendar and resource timeline UIs”

> “For product engineers who need scheduling behavior without adopting another component library.”

> “Try it with sample data” — “Opens an editable resource timeline in this page.”

The three facts are visible in the mobile viewport: “Free to use under MIT”, “Demo data stays in this tab”, and “Demo works offline after the first visit.” The mobile primary action and facts fit within 844 px. There was no horizontal overflow or console error.

## 2. Copy audit

Counts treat a hyphenated item, version, code identifier, or code-formatted date as one word. Code blocks, navigation labels, and standalone API identifiers are not sentences; their headings and actions were also checked below. No audited sentence exceeds 22 words. The banned-word scan has no match for `leverage`, `seamless`, `effortless`, `robust`, `powerful`, `intuitive`, `reimagine`, `supercharge`, `unlock`, `delightful`, `journey`, `ecosystem`, or `AI-powered`.

### Landing-page sentences

| Copy | Words |
| --- | ---: |
| Build calendar and resource timeline UIs | 6 |
| For product engineers who need scheduling behavior without adopting another component library. | 12 |
| Opens an editable resource timeline in this page. | 8 |
| Free to use under MIT | 5 |
| Demo data stays in this tab | 6 |
| Demo works offline after the first visit | 8 |
| You supply the interface. | 4 |
| The package supplies scheduling logic. | 5 |
| See a staffed studio schedule | 5 |
| The demo opens with rooms, people, and scheduled work. | 10 |
| Add scheduling behavior in three steps | 6 |
| Define resources and events. | 4 |
| Pass people, rooms, dates, and times as TypeScript objects. | 10 |
| Calculate the calendar layout. | 4 |
| Choose day, week, continuous month, or resource timeline. | 8 |
| Render your interface. | 3 |
| Render it with your Tailwind styles and save data where you choose. | 12 |
| Lay out resource timelines | 4 |
| Position events across people, rooms, tools, or tracks, including events that cross the visible time range. | 16 |
| Render nearby months | 3 |
| Render only the nearby months as someone scrolls. | 8 |
| Move events with input controls | 5 |
| Create, move, and resize events with pointer or keyboard controls. | 10 |
| You control data and rendering | 5 |
| The package does not store data, manage accounts or payments, or create repeated events from recurrence rules. | 17 |
| The documentation site does not load scripts, fonts, or other files from third-party sites. | 15 |
| Install the v0.1.0 release file from this site. | 9 |
| Call five scheduling functions | 4 |
| Scheduling logic for interfaces you design. | 6 |

### README sentences

| Copy | Words |
| --- | ---: |
| Headless Scheduler is a TypeScript scheduling library for booking, staffing, and planning interfaces. | 13 |
| It supplies behavior and calendar data, not UI components. | 9 |
| Version 0.1.0 includes day, week, continuous month, and resource timeline models under the MIT license. | 15 |
| The core works without installing other packages. | 7 |
| A React adapter is optional. | 5 |
| Open the demo. | 3 |
| The demo opens with rooms, people, and scheduled work. | 10 |
| You can edit sample JSON, move or resize events, switch views, and reset the demo. | 15 |
| Demo edits stay in memory and clear on reload or reset. | 11 |
| Install the v0.1.0 release file from this site. | 9 |
| The download supports JavaScript `import` and `require`, includes TypeScript types and CSS, and adds React support only when requested. | 18 |
| The `@claim:readme-example` test runs this example. | 6 |
| Create, move, or resize interactions at fixed time intervals. | 9 |
| Use `getGridNavigation` to map Arrow, Home, End, Page Up, and Page Down keys to grid positions. | 16 |
| Choose the built-in date handling, Temporal, or date-fns. | 9 |
| Pass complete ISO dates such as `2026-08-27T09:00:00Z`. | 7 |
| Version 0.1 does not expand recurring events. | 8 |
| Expand them before passing events to the library. | 8 |
| Import the preset CSS or copy it into Tailwind. | 10 |
| Change its `--hs-*` colors, or render your own HTML from the calendar data. | 13 |
| `createScheduler` creates state and returns create, update, move, resize, and remove methods. | 12 |
| `buildMonth` and `getContinuousMonthWindow` calculate month data. | 6 |
| `buildTimeGrid`, `buildResourceTimeline`, and `layoutOverlaps` calculate event positions. | 7 |
| `createPointerInteraction` handles pointer create, move, and resize actions. | 8 |
| `getGridNavigation` maps keyboard input to grid positions. | 7 |
| Date adapters provide built-in, Temporal, or date-fns calculations. | 8 |
| `HeadlessScheduler` and `useScheduler` provide optional React bindings. | 7 |
| `npm run build` writes the package to `dist/package` and the static site to `dist/site`. | 12 |
| The site output includes the v0.1.0 release file and route files. | 10 |
| The documentation site does not load scripts, fonts, or other files from third-party sites. | 15 |
| The service worker uses Cache Storage for offline pages and assets. | 11 |
| The package includes no telemetry or network calls. | 8 |
| Applications choose how to store scheduler data. | 7 |
| The package build targets ES2022 and pointer interactions use the Pointer Events API. | 13 |
| The release contains ESM and CommonJS builds plus declarations. | 9 |
| React 18 and 19 can use the optional adapter. | 10 |
| Vue and Svelte adapters, recurrence expansion, iCal parsing, printing, and a hosted builder are outside version 0.1. | 18 |
| Report security issues privately by following `SECURITY.md`. | 7 |
| Do not open a public issue for a security report. | 9 |
| MIT © 2026 Sociobot (Param Factory). | 5 |
| See `LICENSE`. | 2 |

Headings are meaningful in a screen-reader heading list: “Package demo”, “Add scheduling behavior in three steps”, “Lay out resource timelines”, “Render nearby months”, “Move events with input controls”, “You control data and rendering”, “Install the scheduler package”, and “Call five scheduling functions.” The action names state their result: Try it with sample data, Open the demo, Apply sample event, Reset demo, Start for real — install the package, Close without adding, Copy install command, Read the privacy details, Read the API, and Return home. Terms are consistent: **demo**, **v0.1.0 release file**, **resource timeline**, and **continuous month**.

No copy finding was raised.

## 3. Demo and sandbox

The hero action takes one click to `/?demo=1`. On the first screen, it already shows an editable resource timeline with realistic room and person resources (Studio A, Prototype lab, Maya Chen, Noah Williams) and scheduled work (including Morning briefing and Prototype review).

- The persistent banner reads “Demo — sample data, nothing is saved” and exposes Reset demo and Start for real — install the package.
- Replacing “Morning briefing” with “Review 3 edit” in the sample JSON changed the displayed event.
- Reset demo restored Morning briefing.
- Before and after the flow, cookies were empty and localStorage, sessionStorage, and IndexedDB each had zero entries/databases.
- Network interception recorded only `https://headless-scheduler.sociobot.in`.
- After service-worker control, offline reload retained Studio A and Morning briefing. The registered offline test also changes views and edits an event while offline.

This is a package-backed editable playground, not a static mock. The live page declares `v0.1.0 package demo`, and its fresh-project snippet names the same served release artifact.

## 4. Claims

`.factory/claims.json` contains 33 complete entries. `npm run check:claims` confirmed 33 unique `@claim:` tags and an exact one-to-one mapping. From fresh clone `/tmp/headless-scheduler-review-3-HNjff9`, `npm run test:claims:each` ran each declared test independently against a newly built isolated site. **33 passed, 0 failed.** The matrix is retained at `/tmp/review-3-claim-matrix.json` in this review container.

| Claim groups exercised | Result |
| --- | --- |
| release artifact, ESM/CommonJS, declarations, MIT, optional React, preset CSS | Pass |
| README consumer example, headless core, immutable operations, date adapters and DST | Pass |
| resource, overlap, month, pointer, and grid-keyboard models | Pass |
| all four playground views, shared edits, seeded sample, keyboard controls | Pass |
| isolation/reset, same-origin privacy, no package side effects, offline sample | Pass |
| route contract and static artifact | Pass |

The landing page and README were re-read after the matrix. Every visitor-reliance statement maps to a registered claim: licensing (`mit-license`), package composition (`package-formats`, `typescript-declarations`, `zero-runtime-dependencies`, `react-adapter`, `preset-css`), scheduling behavior (`scheduler-operations`, `resource-layout`, `month-models`, `pointer-modes`, `keyboard-controls`), demo behavior (`package-playground`, `sample-seed`, `shared-demo-state`, `demo-isolation-reset`, `offline-demo`), privacy (`privacy-boundary`, `package-side-effects`), and routes/build (`route-contract`, `static-site-artifact`). No unlisted claim was found.

## 5. Earlier findings rechecked

Every earlier review, polish report, verification report, and handoff in `.factory/` was read. The following checks confirm the repairs in the current live deployment and current source rather than accepting their prior “fixed” labels.

| Earlier finding IDs | Fresh confirmation | Result |
| --- | --- | --- |
| Review 1: 1–5 | Served v0.1.0 package installs in a temporary consumer; cold hero is plain and demo-led; `/demo` is real; 33 claims exist; unknown route returns styled HTTP 404. | Fixed |
| Review 1: 6–7 | All five checked routes have route-specific metadata, shared skeleton, canonical/OG/favicon; app navigation and Back move focus to the destination H1 and announce it. | Fixed |
| Review 1: 8–11 | The full audit above has no overlong/jargon regression; the required landing sequence exists; mobile controls pass 44 px check; home title is 49 characters. | Fixed |
| Review 1: UC-01–UC-14 | Fresh claim matrix passed MIT, release formats/types, scope, package playground, shared state, resource/month, pointer, keyboard, and README evidence. | Fixed |
| Review 1: UC-15–UC-28 | Fresh matrix passed offline/isolation, core/React, date adapters, README example, pointer validation, complete ISO dates, and time-zone boundaries. | Fixed |
| Review 1: UC-29–UC-42 | Fresh matrix passed recurrence scope, CSS hooks, artifact/route composition, privacy/cache behavior, ES2022/Pointer Events, and excluded-module scope. | Fixed |
| Review 1: UC-43–UC-53 | Direct interception plus the fresh matrix passed privacy/storage, reset, package side-effect channels, immutable core operations, layout, boundary keyboard navigation, date adapters, and React 18/19. | Fixed |
| Review 2: F-2-1–F-2-5 | Tests now extract/compile/run the README example, instrument all cited side-effect surfaces, test grid boundaries, edit the offline sample, and inspect the installed release MIT file and four views. | Fixed |
| Review 2: F-2-6–F-2-23 | Current landing and README copy matches the plain-word rewrites; demo/release-file terms are consistent; the start and dialog actions state their outcomes. | Fixed |
| Review 2: F-2-24–F-2-28 | Header includes Privacy, hero includes free/isolation/offline facts, no registry assertion remains, sample content has a claim, and `SECURITY.md` is linked. | Fixed |

The later independent verification’s resize announcement and keyboard-resize issue are also rechecked: live smoke passed pointer resize, keyboard resize, and the exact duration announcement.

## 6. Structure, links, identity, and accessibility

Direct live requests and browser navigation verified `/` (200), `/demo` (200), `/privacy` (200), `/terms` (200), and `/missing-page` (404). Each page has one H1, a descriptive ≤155-character description, canonical, Open Graph image/url, Twitter card, SVG favicon, apple-touch icon, shared header with Privacy, shared footer with Privacy/Terms/build identity, and the intended title pattern. The Back-button focus check initially waits for the route effect, then confirms focus is on the home H1 and the live announcement is updated.

All non-fragment links across those routes were crawled: the product routes and the GitHub source/LICENSE links each returned 200. `robots.txt` and `sitemap.xml` are present; the sitemap includes every public page. `npm run check:headers -- https://headless-scheduler.sociobot.in` passed all ten header checks after a local build.

The 404 is a designed page in the paper/riso system, not a browser default. The visual surface is distinct from a generic SaaS template: warm paper stock, registration offsets, editorial serif display type, hand-drawn ink rules, overlapping paper slips, and the original riso schedule art documented in `.factory/design.md`. It preserves the required information sequence without a generic gradient/card hero.

`npm run check:smoke -- https://headless-scheduler.sociobot.in` passed at 390 × 844 and 1440 × 900 (add event, keyboard move/resize, month navigation, correct resize feedback, zero console errors). `npm run check:a11y -- https://headless-scheduler.sociobot.in /tmp/review-3-axe-live.json` reported zero axe violations on Home, Demo, Privacy, Terms, and 404. `npm test` passed 29/29 unit tests.

## 7. Missed leverage

No missed-leverage finding. The brief is a headless calendar library, explicitly excludes recurrence expansion, iCal parsing, printing, hosted-builder work, and non-React adapters in v0.1. Import/export, sync, and an AI step are application concerns rather than an implied library job; adding them would contradict the documented headless, consumer-owned-storage boundary. No decorative AI feature or provider key is present.

## What would make this perfect

Keep this exact standard on the next release: rerun every claim separately from a clean clone, replay the offline editable demo, and retain the short vocabulary and package-backed playground when adding APIs. No product change is requested from this review.
