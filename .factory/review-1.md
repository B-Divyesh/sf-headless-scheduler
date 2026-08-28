# Adversarial first-read review 1 — FAIL

Date: 2026-08-28
Live URL: <https://headless-scheduler.sociobot.in>
Reviewed commit: `454a333f14d294fb073ced6fb723d1358152f5a4`
Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context

## Verdict

**FAIL.** There are five blocking findings and six additional findings. A pass requires zero blocking findings and no more than three minor findings.

1. **BLOCKING — the advertised install command fails.** A clean temporary consumer running `npm install headless-scheduler` received `E404 Not Found` from npm.
2. **BLOCKING — the first screen does not identify the audience or a single correct first action.** The headline is metaphorical, and the styled primary action skips the demo.
3. **BLOCKING — there is no contract-compliant library demo.** The embedded source build has realistic data but no `/demo` state, sandbox banner, Reset, “Start for real,” editable package input, or published-package proof.
4. **BLOCKING — `.factory/claims.json` and all `@claim:*` tests are absent.** Every claim on the site and in the README is unlisted.
5. **BLOCKING — routing is broken.** `/demo` and an unknown path both return the landing page with HTTP 200; there is no designed 404.
6. **Major — route metadata and the legal-page skeleton are incomplete.** Open Graph, Twitter, Apple touch icon, route canonicals/descriptions, and consistent header/footer are missing.
7. **Major — navigation does not manage focus or announce route changes.** Hash navigation and Back leave focus on `<body>`.
8. **Major — the landing copy contains jargon, metaphors, inconsistent licensing terms, and one 24-word sentence.** Several buttons do not name their result.
9. **Major — the required landing structure is incomplete.** There is no three-step “How it works” section or plain “What it does not do / privacy” section.
10. **Major — six mobile interactive targets are shorter or narrower than 44 px.** The GitHub target is 28 × 20 px.
11. **Minor — the home title is 64 characters and uses marketing language.** The required maximum is 60 characters.

Evidence is in `.factory/evidence/review-1-browser.json`, the cold screenshots, the demo screenshot, `.factory/evidence/review-1-axe-live.json`, and `.factory/evidence/review-1-verify/`.

## 1. Cold first screen

### What I could answer before scrolling

| Question | 390 px | Desktop | Result |
| --- | --- | --- | --- |
| What does this do? | I could infer that it supplies calendar logic, resource timelines, month scrolling, and drag behavior for a Tailwind UI. “Headless” is not explained. | Same, with a scheduling collage that helps suggest the use case. | Partial |
| For whom? | Not stated. “Your Tailwind system” implies a developer but does not name one. | Not stated. | **Blocking** |
| What should I click first? | “Start building” is visually primary and goes to install; “Try the timeline ↓” is secondary. | Same two competing actions. | **Blocking** |

The exact text that fails the first-read requirement is:

> “Your schedule. Your surface.”

> “A headless calendar core with resource timelines, continuous months, and pointer interactions—ready for your Tailwind system.”

> “Start building” / “Try the timeline ↓”

Why this loses a first-time visitor: the headline does not name a job, the supporting sentence uses five unexplained technical terms, and the visually primary action leads to an install command that currently fails. The audience is never named.

Concrete replacement:

- Headline: **“Build calendar and resource timeline UIs”**
- Audience sentence: **“For product engineers who need scheduling behavior without adopting another component library.”**
- Primary action: **“Try it with sample data”**
- Adjacent outcome: **“Opens an editable resource timeline in this page.”**
- Three facts: **“MIT licensed” · “No runtime dependencies in core” · “Demo edits stay in this tab”**

## 2. Copy audit

Word counts use word-like tokens; punctuation and Markdown markers do not count. Code blocks and API symbol lists are code, not sentences. Immediately reachable error, empty, and offline copy is included. `J` = unexplained jargon, `H` = heading/metaphor unclear out of context, `T` = inconsistent term, `A` = action does not name its result, `C` = unlisted claim, and `>22` = hard-cap failure.

### Landing page sentences and fragments

| # | Exact copy | Words | Flag and proposed rewrite |
| ---: | --- | ---: | --- |
| 1 | “No premium views” | 3 | T/C — “All views are included under the MIT license.” |
| 2 | “Your schedule.” | 2 | H — replace #2–3 with “Build calendar and resource timeline UIs.” |
| 3 | “Your surface.” | 2 | H — same replacement as #2. |
| 4 | “A headless calendar core with resource timelines, continuous months, and pointer interactions—ready for your Tailwind system.” | 17 | J — “Scheduling logic for product engineers who want to design their own Tailwind interface.” |
| 4a | “FREE / OPEN / HEADLESS” | 3 | J — remove the decorative slogan or use “MIT licensed · source available · UI not included.” |
| 4b | “0 core dependencies” | 3 | C — “No runtime dependencies in core,” with a clean-package dependency test. |
| 4c | “4 useful views” | 3 | C/vague — name the four views instead. |
| 4d | “MIT forever” | 2 | C/unverifiable — “MIT licensed.” |
| 5 | “Structure without somebody else’s skin.” | 5 | H — “You control the rendered interface.” |
| 6 | “The actual library, in motion” | 5 | C — “Interactive source-build example” until the published package powers it. |
| 7 | “Plan across people and places” | 5 | Pass. |
| 8 | “Drag events to reschedule.” | 4 | Pass. |
| 9 | “Arrow keys move a focused event by 15 minutes; tab to its resize control, then use left or right arrows to change its duration.” | 24 | >22 — “Arrow keys move a focused event by 15 minutes. Tab to Resize, then use Left or Right to change its duration.” |
| 10 | “Every view below comes from the same headless state.” | 9 | J/C — “All four views share one scheduler state.” |
| 11 | “Ready locally” | 2 | C/ambiguous — “Demo runs in memory.” |
| 12 | “Tip: drag an event or focus it and use arrow keys.” | 11 | Pass. |
| 13 | “Why another calendar?” | 3 | Pass. |
| 14 | “Because layout is infrastructure, not a licence tier.” | 8 | H/T — “Resource timelines are included under MIT.” |
| 15 | “Resource scheduling should not force your product into a vendor’s visual language—or its premium plan.” | 16 | T/marketing comparison — “Use the scheduling behavior without adopting the example styles.” |
| 16 | “Headless Scheduler gives you date math, collision geometry, input behavior, and accessible navigation as typed primitives.” | 16 | J/C — “The library calculates dates and event positions, then returns typed data for your UI.” |
| 17 | “Resource timelines” | 2 | Pass after defining it as rows for people or rooms across time. |
| 18 | “Hours or days across any number of people, rooms, tools, or tracks.” | 12 | C/unbounded — “Lay out hours or days across people, rooms, tools, or tracks.” |
| 19 | “Clipping and percentages are already calculated.” | 6 | C/J — “The library returns clipped event positions as percentages.” |
| 20 | “Keep scrolling” | 2 | H — “Scroll through continuous months.” |
| 21 | “Windowed month models make an endless vertical calendar practical without rendering an endless DOM.” | 14 | J/C — “Render only the nearby months as people scroll.” |
| 22 | “Move like you mean it” | 5 | H — “Drag, resize, and use the keyboard.” |
| 23 | “Pointer capture, snapping, resize handles, keyboard intent, and live announcements—without prescribing components.” | 13 | J/C — “Create, move, and resize events with mouse, touch, or keyboard controls.” |
| 24 | “One package.” | 2 | Pass. |
| 25 | “Bring your stack.” | 3 | J/H — “Use vanilla TypeScript or React.” |
| 26 | “Ship the scheduler, not the fight.” | 6 | H — “Install the scheduler library.” |
| 27 | “ESM, CJS, declarations, zero runtime dependencies in the core.” | 9 | J/C — “Use ESM or CommonJS. Type declarations are included. The core has no runtime dependencies.” |
| 28 | “React is optional.” | 3 | C — keep after adding a package-consumer claim test. |
| 29 | “Small on purpose” | 3 | H — “Five core API functions.” |
| 30 | “Primitives you can hold in your head” | 7 | J/H — “Use five core API functions.” |
| 31 | “Calendar infrastructure, printed your way.” | 5 | H — “Style the calendar your way.” |
| 32 | “MIT licensed.” | 2 | C — keep after testing the packed license. |
| 33 | “No telemetry.” | 2 | C — keep after a network-interception claim test. |
| 34 | “No licence wall.” | 3 | T/C — “All views are included under MIT.” |
| 35 | “You’re offline.” | 2 | Pass. |
| 36 | “The in-memory schedule still works; persistence is yours to connect.” | 10 | C/J — “The example still works. Changes remain in memory until you reload.” |
| 37 | “No events in this range” | 5 | Pass. |
| 38 | “Choose another date or add the first event.” | 8 | Pass. |
| 39 | “Add a title so people know what is scheduled.” | 9 | Pass. |

Repeated accessible instructions are clear but should be shortened: “Drag or use left and right arrows to move; Delete to remove” can become “Drag or press Left or Right to move. Press Delete to remove.” The resize instruction can become “Press Left or Right to change duration by 15 minutes.”

### README sentences

| # | Exact copy | Words | Flag and proposed rewrite |
| ---: | --- | ---: | --- |
| 1 | “An MIT, headless TypeScript scheduler for product engineers building booking, staffing, and planning interfaces.” | 14 | J/C — “A TypeScript scheduling library for engineers building booking, staffing, and planning interfaces. It supplies behavior, not UI components.” |
| 2 | “It includes resource timelines and continuous month scrolling without a commercial view licence, and leaves the DOM and design system to you.” | 22 | J/T/C — “It includes resource timelines and continuous month scrolling under MIT. You render and style the interface.” |
| 3 | “React is an optional peer dependency.” | 6 | J/C — define “peer dependency” in Install or link to npm’s definition. |
| 4 | “The Temporal adapter works with native `Temporal` or `@js-temporal/polyfill`; the date-fns adapter accepts the date-fns functions you already ship.” | 19 | J/C — “Choose native Temporal, its polyfill, or pass the listed date-fns functions.” |
| 5 | “The documented example above is compiled and exercised by the test suite.” | 12 | C — keep after adding `@claim:readme-example`. |
| 6 | “Use `mode: 'create'`, `'move'`, `'resize-start'`, or `'resize-end'`.” | 7 | Pass for API documentation. |
| 7 | “`pixelsPerMinute` and `snapMinutes` must be positive finite numbers; invalid configuration throws when the interaction is created.” | 16 | C — keep after adding a tagged validation test. |
| 8 | “Pointer capture keeps drags stable.” | 5 | J/C — “The active element keeps receiving drag events until release.” |
| 9 | “Keyboard equivalents are available through `getGridNavigation`, and `scheduler.announce()` exposes changes for an `aria-live` region.” | 14 | J/C — split and define the screen-reader result. |
| 10 | “Events use ISO strings at the public boundary.” | 8 | J/C — “Pass event dates as ISO strings in the public API.” |
| 11 | “Supply offsets or `Z` for instants; `timeZone` controls labels and calendar boundaries.” | 12 | J/C — “Include an offset or `Z` in each instant. `timeZone` controls labels and day boundaries.” |
| 12 | “The default `nativeDateAdapter` uses the platform `Intl` timezone data, so scheduler day/week/month boundaries and direct `addDays`/`addMonths` calls remain on the requested local calendar date across DST (pass the zone as the optional third argument for direct calls).” | 38 | >22/J/C — “`nativeDateAdapter` uses the browser’s `Intl` timezone data. Day, week, and month boundaries stay on the requested local date across DST. Pass the zone as the third argument to direct date-add calls.” |
| 13 | “The Temporal adapter provides the same behavior when you prefer Temporal.” | 11 | C — keep after a tagged parity test. |
| 14 | “Recurrences must be expanded by the caller in v0.1.” | 9 | J — “Version 0.1 does not expand recurring events. Expand them before passing events to the library.” |
| 15 | “Import `headless-scheduler/preset.css` or copy it into your Tailwind `@layer components`, then override variables such as `--hs-paper`, `--hs-ink`, and `--hs-accent`.” | 19 | J/C — split after “components” and link to a tested sample. |
| 16 | “Stable `hs-*` hooks are provided, but the core never requires this DOM.” | 12 | J/C — “The preset provides documented `hs-*` class hooks. The core returns data and does not render DOM.” |
| 17 | “All exported types are emitted in `dist/`.” | 7 | C — keep after a packed type-consumer test. |
| 18 | “See the live API and interactive example at https://headless-scheduler.sociobot.in.” | 10 | C — “Open the interactive source-build example…” until it uses the published package. |
| 19 | “`npm pack` and `npm publish` run the library build through `prepack`, so every declared ESM, CJS, declaration, React, and CSS export exists in a clean tarball.” | 26 | >22/J/C — “`prepack` builds the library before `npm pack` or `npm publish`. A package test imports each declared JavaScript, React, type, and CSS export.” |
| 20 | “`npm run dev` serves the documentation site.” | 7 | Pass. |
| 21 | “The static `dist/site` directory can be deployed as-is; it includes `staticwebapp.config.json` for Static Web Apps cache and security headers plus a build-generated service worker that precaches the emitted shell.” | 29 | >22/J/C — “Deploy `dist/site` as the static site. It includes the host configuration and a service worker that caches the site shell.” |
| 22 | “No analytics, accounts, cookies, local storage, third-party fonts, or runtime CDNs are used.” | 13 | C — keep after a clean-context request/storage test. Clarify that Cache Storage holds the offline shell. |
| 23 | “For the production container used by the factory deployment:” | 9 | Pass. |
| 24 | “It builds `dist/site` in a separate stage, then serves it on port 8080 as a non-root user.” | 17 | C — keep after a container smoke test. |
| 25 | “The runtime applies SPA fallback, no-store HTML responses, immutable caching for Vite's hashed assets, PWA-aware service-worker caching, and browser security headers.” | 21 | J/C — split into response-cache and security-header sentences. |
| 26 | “Evergreen browsers with ES2022 and Pointer Events.” | 7 | J/C — name tested browser versions or say “Browsers that support ES2022 and Pointer Events.” |
| 27 | “The package ships ESM and CJS.” | 6 | J/C — keep after a packed ESM/CommonJS consumer test. |
| 28 | “React 18/19 is supported as an optional peer; Vue and Svelte adapters are intentionally outside v0.1, while the core works in either.” | 22 | J/C — “React 18 and 19 are supported through the optional adapter. Vue and Svelte can consume the framework-independent core; adapters are not included.” |
| 29 | “Run `npm test` and `npm run build:site` before opening a change.” | 11 | Pass. |
| 30 | “Please add a focused regression test for behavioral changes.” | 9 | Pass. |
| 31 | “Security issues should be reported privately to the repository owner.” | 10 | Pass, but replace “repository owner” with a specific security contact or process. |

The seven Public API list items are sentence-like claim fragments and also require plain wording and claim tests:

| Exact copy | Words | Flag and proposed rewrite |
| --- | ---: | --- |
| “`createScheduler(options)` — observable event/view state and immutable CRUD/move/resize operations.” | 9 | J/C — “Create scheduler state and return new state for create, update, move, resize, and remove operations.” |
| “`buildMonth`, `getContinuousMonthWindow` — calendar math and virtual month windows.” | 8 | J/C — “Build one month or a finite window of nearby months.” |
| “`buildTimeGrid`, `buildResourceTimeline`, `layoutOverlaps` — view models with collision columns.” | 8 | J/C — “Calculate time-grid, resource-row, and overlapping-event positions.” |
| “`createPointerInteraction` — pointer create/move/resize with snapping.” | 5 | J/C — “Handle mouse or touch create, move, and resize actions at fixed intervals.” |
| “`getGridNavigation` — Arrow/Home/End/PageUp/PageDown keyboard intent.” | 4 | J/C — “Map the listed keys to the next grid position.” |
| “`nativeDateAdapter`, `createTemporalAdapter`, `createDateFnsAdapter` — replaceable date math.” | 6 | J/C — “Choose built-in, Temporal, or date-fns date calculations.” |
| “`HeadlessScheduler`, `useScheduler` from `/react` — optional React bindings.” | 7 | J/C — “Use the optional React component and hook.” |

The license line contains a further claim: “MIT © 2026 Sociobot (Param Factory). See LICENSE.” (7 words). Keep it after the packed-license claim test.

The README’s non-sentence release line also contains four unlisted claims: “framework-agnostic core,” “optional React adapter,” “zero core dependencies,” and “ESM + CJS + declarations.”

### Headings and actions

| Copy | Finding | Concrete replacement |
| --- | --- | --- |
| “Your schedule. Your surface.” | H1 is a metaphor, not the job. | “Build calendar and resource timeline UIs” |
| “Move like you mean it” | Does not identify the section. | “Drag, resize, and use the keyboard” |
| “Ship the scheduler, not the fight.” | Marketing metaphor. | “Install the scheduler library” |
| “Small on purpose” / “Primitives you can hold in your head” | Vague without surrounding copy. | “Use five core API functions” |
| README “Usage” | Generic in a screen-reader heading list. | “Create a scheduler” |
| “Start building” | Does not name the result and leads to a failing command. | “Install Headless Scheduler” only after publication |
| “Try the timeline ↓” | Does not state that sample data opens. | “Try it with sample data” |
| “Today” | Names a date, not the result. | Accessible name “Show today” |
| “Day / Week / Month / Timeline” | Visual tab labels are acceptable, but accessible names do not name the result. | “Show day view,” etc. |
| “Copy” | Does not name what is copied. | “Copy install command” |
| “npm install →” | Looks like a command but is an in-page link. | “View install command” |

### Terminology consistency

| Concept | Terms currently used | Use one term |
| --- | --- | --- |
| Included/free views | “premium views,” “commercial view licence,” “licence tier,” “premium plan,” “licence wall” | “All views are included under MIT.” |
| Product | “headless calendar core,” “scheduler,” “actual library,” “package” | “scheduler library”; define “core” and “React adapter” only when needed |
| Demo state | “Ready locally,” “in-memory schedule,” “interactive example,” “actual library” | “source-build example” now; “package playground” after publication |
| Month view | “continuous months,” “continuous month scrolling,” “windowed month models,” “endless vertical calendar” | “continuous month view” |

No banned plain-words adjective appears verbatim. “Useful,” “actual,” “stable,” “practical,” and “forever” are vague or unproved and should be replaced by named behavior.

## 3. Demo and sandbox

**BLOCKING.** The first screen has no “Try it with sample data” action. Clicking the nearest equivalent, “Try the timeline ↓,” only changes the URL to `/#demo` and scrolls to an embedded schedule.

What works:

- The first visible scheduler state contains four realistic resources and four realistic events.
- Add Event changes the visible count from four to five.
- Reload returns it to four.
- Before and after editing, localStorage, sessionStorage, cookies, and IndexedDB are empty.
- The observed requests are same-origin document, JavaScript, CSS, and image requests.

What fails the library-demo contract:

- `/demo` is not a demo route; it renders the landing hero with the home title and canonical.
- There is no “Demo — sample data, nothing is saved” banner.
- There is no “Reset demo” control.
- There is no “Start for real” path.
- There is no documented demo storage namespace or `.factory/demo.md`.
- The playground is bundled from repository source (`../../src`), not the published package.
- There is no editable input-to-live-output package playground.
- The copy-paste command cannot work because the package is absent from npm.

Why this misleads: “The actual library, in motion” implies a consumer can install and reproduce the behavior, but the page proves only that the repository source can be bundled into its own site.

Concrete fix: publish `headless-scheduler`, make `/demo` load that published version, show a seeded editable input beside live output, add the persistent demo banner and Reset/Start controls, isolate demo state under a `demo:` namespace or memory store, and document the entry/reset/storage behavior in `.factory/demo.md`. Add a clean temporary-project test that installs the exact published version and runs the displayed snippet.

## 4. Claims

**BLOCKING.** `.factory/claims.json` does not exist. `rg '@claim:'` found no tagged tests. Therefore the required “run every listed test” set contains zero tests, and none of the product’s claims has the required traceability. The general test suite passes 28/28, but that is not a claims registry.

One claim also fails directly:

> `npm install headless-scheduler`

Clean temporary directory result: npm `E404 Not Found - GET https://registry.npmjs.org/headless-scheduler` with exit code 1.

Every unlisted claim found on the landing page, README, and linked privacy page is recorded below. Each row is a finding; the visitor could rely on the quoted text, but there is no claims entry or exactly tagged test.

| ID | Exact claim | Why it is unproved or misleading | Concrete fix / required observable test |
| --- | --- | --- | --- |
| UC-01 | “No premium views” | Licensing/availability claim has no registry entry. | Rewrite “All views are included under MIT”; pack and inspect the license and exports under `@claim:mit-all-views`. |
| UC-02 | “A headless calendar core with resource timelines, continuous months, and pointer interactions…” | Bundles four feature claims without traceability. | Split claims; test each view model and pointer commit through the demo/package. |
| UC-03 | “0 core dependencies” | Quantitative dependency claim is unlisted. | Install the packed package and assert no production dependency tree under `@claim:zero-core-dependencies`. |
| UC-04 | “4 useful views” | “Useful” is untestable and the number is unlisted. | Name day, week, continuous month, and resource timeline; open each in `@claim:four-views`. |
| UC-05 | “MIT forever” | “Forever” cannot be verified. | Replace with “MIT licensed” and test the packed license. |
| UC-06 | “The actual library, in motion” | The page bundles repository source, not the npm package. | Label it “source-build example” or power it from the published package and assert the loaded version. |
| UC-07 | “Every view below comes from the same headless state.” | No tagged cross-view state test. | Edit one event, switch all views, and assert the same event state. |
| UC-08 | “Headless Scheduler gives you date math, collision geometry, input behavior, and accessible navigation as typed primitives.” | Four claims are combined. | Split and tag unit/consumer tests for date boundaries, overlap layout, input commits, and grid navigation. |
| UC-09 | “Hours or days across any number of people, rooms, tools, or tracks.” | “Any number” is unbounded. | Remove “any number”; test representative resource counts and both slot scales. |
| UC-10 | “Clipping and percentages are already calculated.” | Observable output is not registered. | Tag a clipped-range layout assertion. |
| UC-11 | “Windowed month models make an endless vertical calendar practical…” | “Endless” and “practical” are unbounded judgments. | State the finite overscan behavior and assert the returned window size. |
| UC-12 | “Pointer capture, snapping, resize handles, keyboard intent, and live announcements…” | Multiple interaction/accessibility claims lack tagged coverage. | Give each behavior an observable browser or unit test. |
| UC-13 | “ESM, CJS, declarations, zero runtime dependencies in the core. React is optional.” | Package-format and dependency claims are unlisted. | Install the tarball in clean ESM, CJS, TypeScript, and React consumers and inspect dependencies. |
| UC-14 | “MIT licensed. No telemetry. No licence wall.” | License/privacy/availability claims are grouped and unlisted. | Split; inspect the license and intercept a full demo flow for external requests. |
| UC-15 | “The in-memory schedule still works; persistence is yours to connect.” | Offline and persistence behavior is unlisted. | Go offline in `/demo`, mutate, reload according to the stated persistence policy, and assert storage/network boundaries. |
| UC-16 | README release line: “framework-agnostic core · optional React adapter · zero core dependencies · ESM + CJS + declarations” | Four package claims have no entries. | Add clean consumers for plain JS, React, ESM, CJS, and declarations plus dependency inspection. |
| UC-17 | “An MIT, headless TypeScript scheduler for product engineers building booking, staffing, and planning interfaces.” | License/artifact claim is unlisted. | Pack it, inspect license/types, and run the displayed scheduling example. |
| UC-18 | “It includes resource timelines and continuous month scrolling… and leaves the DOM and design system to you.” | Feature and no-DOM claims are unlisted. | Assert returned models and that core import does not load React/render DOM. |
| UC-19 | “React is an optional peer dependency.” | Package metadata claim is unlisted. | Install/import core without React and adapter with React 18/19. |
| UC-20 | “The Temporal adapter works with native `Temporal` or `@js-temporal/polyfill`; the date-fns adapter accepts the date-fns functions you already ship.” | Adapter compatibility has no tagged consumer test. | Exercise both adapters from a clean packed consumer. |
| UC-21 | “The documented example above is compiled and exercised by the test suite.” | A matching general test exists, but not a claim-tagged test. | Tag the exact README example `@claim:readme-example`. |
| UC-22 | “Use `mode: 'create'`, `'move'`, `'resize-start'`, or `'resize-end'`.” | Mode support is unlisted. | Commit each mode against sample events and assert emitted changes. |
| UC-23 | “`pixelsPerMinute` and `snapMinutes` must be positive finite numbers; invalid configuration throws…” | Validation claim is unlisted. | Tag positive, zero, negative, infinity, and NaN cases. |
| UC-24 | “Pointer capture keeps drags stable.” | No observable capture-loss claim test is registered. | Drag outside the origin element before release and assert one correct commit. |
| UC-25 | “Keyboard equivalents are available through `getGridNavigation`, and `scheduler.announce()` exposes changes for an `aria-live` region.” | Keyboard and announcement claims are unlisted. | Test documented keys and assert the live region’s spoken text. |
| UC-26 | “Events use ISO strings at the public boundary.” | Public input/output format is unlisted. | Type-test and runtime-test accepted/rejected event date values. |
| UC-27 | “`timeZone` controls labels and calendar boundaries.” | Timezone behavior is unlisted. | Assert labels and boundaries in DST and non-DST zones. |
| UC-28 | “The default `nativeDateAdapter`… remain[s] on the requested local calendar date across DST…” | Strong DST claim has general tests but no claim tag. | Tag both DST boundaries and direct add calls with the exact claim ID. |
| UC-29 | “The Temporal adapter provides the same behavior…” | Parity claim is unlisted. | Run the same boundary cases through both adapters. |
| UC-30 | “Recurrences must be expanded by the caller in v0.1.” | Negative-scope contract is unlisted. | Document it as a limitation and test that recurrence fields are not silently expanded. |
| UC-31 | “Import `headless-scheduler/preset.css`… then override variables…” | Install/export/theme claim is unlisted and npm install currently fails. | Install the published package, import CSS, override one token, and assert computed output. |
| UC-32 | “Stable `hs-*` hooks are provided, but the core never requires this DOM.” | Stability and no-DOM claims are unlisted. | Replace “stable” with a versioned contract; test hooks and core import without DOM globals. |
| UC-33 | “All exported types are emitted in `dist/`.” | Distribution claim is unlisted. | Compile a clean TypeScript consumer against every export. |
| UC-34 | “See the live API and interactive example…” | “Live API” is ambiguous; example is not the published package. | Name the API reference; test `/demo` and the published package version. |
| UC-35 | “`npm pack` and `npm publish` run the library build through `prepack`…” | Tarball completeness is unlisted. | Tag the existing clean-pack consumer check and assert every declared target. |
| UC-36 | “The static `dist/site` directory can be deployed as-is…” | Deployment/service-worker claim is unlisted. | Serve only `dist/site`; test routes, headers, and first-visit/offline reload. |
| UC-37 | “No analytics, accounts, cookies, local storage, third-party fonts, or runtime CDNs are used.” | Privacy claim has no network/storage test entry. | Intercept the whole demo flow and inspect cookies, local/session storage, IndexedDB, and request origins. Clarify Cache Storage use. |
| UC-38 | “It builds `dist/site` in a separate stage, then serves it on port 8080 as a non-root user.” | Container claim is unlisted. | Build/run the image, inspect UID, and request port 8080. |
| UC-39 | “The runtime applies SPA fallback, no-store HTML responses, immutable caching… and browser security headers.” | Multiple HTTP claims are unlisted. | Request HTML, hashed assets, worker, manifest, deep link, and required security headers. |
| UC-40 | “Evergreen browsers with ES2022 and Pointer Events.” | “Evergreen” has no testable browser range. | Publish an explicit support matrix and run its minimum versions. |
| UC-41 | “The package ships ESM and CJS.” | Package-format claim is unlisted. | Install/import/require the published tarball in clean consumers. |
| UC-42 | “React 18/19 is supported… while the core works in [Vue and Svelte].” | Framework compatibility is unlisted. | Test React 18 and 19 plus minimal Vue/Svelte consumers of the core, or narrow the copy. |
| UC-43 | Privacy: “This documentation site does not use analytics, cookies, accounts, local storage, or third-party scripts.” | Observed behavior passes, but there is no registered privacy claim. | Add a clean-context interception/storage test. |
| UC-44 | Privacy: “The interactive example stays in memory and disappears when the page closes.” | Observed reload reset passes, but no claim entry exists. | Add/edit/reload/new-context assertions against `/demo`. |
| UC-45 | Privacy: “The npm library includes no telemetry and makes no network requests.” | Strong library privacy claim is unlisted. | Instrument fetch/XHR/WebSocket/sendBeacon while exercising all public operations. |
| UC-46 | Privacy: “Your application controls all scheduler data and persistence.” | Architectural claim is unlisted. | Assert core operations make no storage writes and changes are returned through callbacks/state only. |
| UC-47 | “`createScheduler(options)` — observable event/view state and immutable CRUD/move/resize operations.” | Public API behavior is unlisted. | Exercise every named operation and assert prior state objects are unchanged. |
| UC-48 | “`buildMonth`, `getContinuousMonthWindow` — calendar math and virtual month windows.” | Public API behavior is unlisted. | Assert month boundaries and finite overscan windows. |
| UC-49 | “`buildTimeGrid`, `buildResourceTimeline`, `layoutOverlaps` — view models with collision columns.” | Layout behavior is unlisted. | Assert positions and columns for overlaps and clipped events. |
| UC-50 | “`createPointerInteraction` — pointer create/move/resize with snapping.” | Interaction behavior is unlisted. | Exercise all modes and assert snapped preview/commit values. |
| UC-51 | “`getGridNavigation` — Arrow/Home/End/PageUp/PageDown keyboard intent.” | Keyboard behavior is unlisted. | Assert every listed key at middle and boundary cells. |
| UC-52 | “`nativeDateAdapter`, `createTemporalAdapter`, `createDateFnsAdapter` — replaceable date math.” | Adapter API claim is unlisted. | Run the same date fixtures through each adapter. |
| UC-53 | “`HeadlessScheduler`, `useScheduler` from `/react` — optional React bindings.” | React export claim is unlisted. | Install the tarball with React 18 and 19 and render both exports. |

Observed checks are evidence, not substitutes for entries in `.factory/claims.json`: same-origin-only initial/demo requests, empty cookies/localStorage/sessionStorage/IndexedDB, edit reset on reload, and offline reload all passed.

## 5. Sandbox and privacy behavior

The current embedded example writes no observed real storage. In a fresh context:

- initial visible event buttons: 4;
- after adding “Audit sample event”: 5;
- after reload: 4;
- localStorage/sessionStorage/cookies/IndexedDB before and after: empty;
- requests during load/edit/reload: same-origin only;
- service-worker-controlled live reload while offline: passed, one H1 rendered, `navigator.onLine === false`.

This confirms the current in-memory example and offline shell behavior. It does **not** confirm demo isolation because there is no demo mode, real-data mode, separate namespace, or transition between them. Add those boundaries before claiming a sandbox.

For the library install path, the clean temporary-directory command failed with npm E404. The repository tarball check passes only against a locally packed tarball; that does not make the public install command true.

## 6. Structure, routes, links, identity, and accessibility

### Blocking routing finding

Quote/evidence:

- `GET /demo` → 200, home title, home H1, home canonical, no demo banner.
- `GET /does-not-exist` → 200, “Your schedule. Your surface.”

Why this loses or misleads a visitor: a copied demo URL does not open the product state, and a bad URL looks valid instead of explaining what went wrong.

Concrete fix: create a real `/demo` route with title “Demo — Headless Scheduler,” its own canonical, focused H1, banner, and seeded state. Add a designed inkboard-style 404 with a “Return home” link, and configure the host to return HTTP 404 for unknown routes while still serving valid deep links.

### Metadata and skeleton findings

| Check | Result | Concrete fix |
| --- | --- | --- |
| Home title | 64 characters: “Headless Scheduler — resource timelines without the licence wall” | “Headless Scheduler — calendar and timeline primitives” |
| `lang`, one H1, `<main>`, image alt | Pass on home. | Keep. |
| Home description/canonical/SVG favicon/theme color | Pass. | Keep. |
| Open Graph/Twitter/1200 × 630 image | Missing. | Add product-art `og:image`, OG title/description, and Twitter card metadata. |
| Apple touch icon | Missing; `/apple-touch-icon.png` falls through to home HTML with 200. | Add a real 180 px icon and link. |
| Privacy/Terms title | Correct pattern. | Keep. |
| Privacy/Terms description/canonical/OG/Twitter/favicon | All missing. | Add route-specific metadata. |
| Privacy/Terms header/footer | Both have zero `<header>` and zero `<footer>`. | Use the consistent site header, footer, skip link, wordmark, legal links, build ID. |
| Sitemap | Lists `/`, `/privacy/`, `/terms/`; no `/demo`. | Add the real demo and designed 404 policy as appropriate. |
| Standard landing order | Header, hero, live preview, capabilities, install, footer exist. | Add a three-step “How it works” and a plain “What it does not do / privacy” section. |
| Footer contract | Privacy/Terms/Source exist. Product one-line, “Built by Param Factory,” and version/build ID are missing. | Add the required footer fields. |
| Link crawl | All 13 rendered home links/anchors and legal-page home links resolve; GitHub links return 200. | Keep; rerun after routing changes. |
| Visual identity | Pass. The warm paper, riso collage, ink offsets, square controls, and editorial type are distinct and match `.factory/design.md`; it is not a generic gradient/card SaaS template. | Keep. |

### Focus, keyboard, and touch findings

Clicking “Try the timeline ↓” changes to `/#demo`, but `document.activeElement` remains `<body>` and the H1 is not focused. Back returns to `/` and again leaves focus on `<body>`. There is no route announcement. Use History API routes, focus the new route H1 with `tabindex="-1"`, and update a polite live region after navigation.

The live axe WCAG 2 A/AA + 2.1 AA run found zero violations. The local smoke test also passed add, keyboard move, keyboard resize, month-grid navigation, pointer resize, and console-error checks at both viewports. These are positive results.

However, the 390 px target-size measurement found:

| Control | Measured box |
| --- | ---: |
| Wordmark/home | 205 × 40 px |
| GitHub | 28 × 20 px |
| Copy | 60 × 36 px |
| Privacy | 66 × 25 px |
| Terms | 54 × 25 px |
| Source | 62 × 25 px |

Concrete fix: give each a minimum 44 × 44 px hit area without changing the visible inkboard treatment.

## 7. Commands and results

| Check | Result |
| --- | --- |
| Fresh 390 px and desktop cold loads | Loaded with zero console errors; screenshots saved. |
| Required “Try it with sample data” lookup | 0 matches. |
| Nearest “Try the timeline ↓” path | Opens `/#demo`; realistic schedule shown; required banner/reset/start controls absent. |
| `npm install headless-scheduler` in temp directory | **FAIL**, npm E404, exit 1. |
| `.factory/claims.json` | **FAIL**, file absent. |
| `rg '@claim:'` | **FAIL**, no tagged tests. |
| `npm test` after `npm ci` | Pass, 28/28. |
| `npm run check` | Pass. |
| `npm run build` | Pass; `dist/package` and `dist/site` produced; site JS 17.26 kB gzip. |
| `npm run check:pack` | Pass for locally packed ESM/CJS/React consumers and seven targets. |
| `npm run check:smoke` | Pass at 390 × 844 and 1440 × 900; zero console errors. |
| live axe check | Pass, zero violations. |
| worker `verify-url.sh` | Pass its basic title/lang/main/alt/console checks. |
| `npm run check:offline` and live offline check | Pass. |
| `npm run check:pwa-update` | Pass. |
| `npm run check:headers` | Pass ten local header checks. |
| Link crawl | Pass; no dead rendered links. |

The passing implementation tests show useful underlying functionality. They do not change the FAIL verdict because installability, first-read clarity, demo contract, claims traceability, and routing are release-blocking requirements.
