# Review 5: Build calendar and resource timeline UIs — PASS

- Date: 2026-09-06
- Work order: `headless-scheduler-review-5`
- Live URL: <https://headless-scheduler.sociobot.in>
- Implementation reviewed: `c4aa78ae557c349f5c9dff7f4fdad0980b4139b7`
- Documentation base reviewed: `b7c0726357fb7d86ca3daef592272fbe13b17ffb`

## Verdict

**PASS. Finding count: 0. Untested claim count: 0.**

The live site, isolated sample demo, installed npm artifact, public API, routes, accessibility, privacy boundary, offline behavior, update path, and every public claim passed this fresh strict review. No product code was changed.

The requested external evidence path `/work/factory-evidence/headless-scheduler-verify-8/qa-report.md` was not present in this container. The complete committed `.factory/verification-8.md` report was read before testing. Its stated evidence and conclusions were not accepted without fresh checks.

## First screen before scrolling

Fresh Chromium contexts opened the live home page at 390 × 844 and 1440 × 900. Both started at the top with no console error or document overflow.

| Question | Visible answer |
| --- | --- |
| Job | “Build calendar and resource timeline UIs” |
| Audience | “For product engineers who need scheduling behavior without adopting another component library.” |
| First action | “Try it with sample data” |
| What the action does | “Opens an editable resource timeline in this page.” |
| Three facts | Free under MIT; demo data stays in this tab; demo works offline after the first visit |

The phone view intentionally removes the decorative hero art. The desktop view keeps the original scheduler collage. Both preserve the same information order and primary action.

## Sample demo and user paths

The first action opened `/?demo=1` in one click. The first populated view already contained Studio A, Prototype lab, Maya Chen, Noah Williams, Morning briefing, Prototype review, Field notes, and Design handoff. “Demo — sample data, nothing is saved” remained visible with Reset demo and Start for real — install the package.

Fresh phone and desktop runs passed:

- Normal use: edit sample JSON, apply it, switch all four views, add an event, move and resize it by keyboard, remove it, and undo removal.
- Invalid input: submit a blank title, malformed JSON, and an unknown resource. Each error was plain, announced, and tied to its field; correction recovered normally.
- Boundary behavior: add an event at 23:59; installed-package tests also covered clipped ranges, grid edges, DST transitions, non-DST zones, and positive-offset month calculations.
- Recovery: reset restored the original five events; reload and exit discarded edits; re-entry restored the sample.
- Empty state: after removing the visible day events, Day showed “No events in this range” and “Choose another date or add the first event.”
- Keyboard and focus: the skip link is first; the dialog focuses its title and returns focus to Add event; event move and resize use 15-minute steps; route navigation and Back focus and announce the H1.
- Mobile: all visible interactive controls measured at least 44 × 44 CSS pixels. The timeline scrolls within its region without page overflow.
- Reduced motion: the media query matched, scrolling became `auto`, and event animation and transition durations became `0.00001s`.

Cookies, localStorage, sessionStorage, and IndexedDB remained empty. The only persistent browser store was one same-origin, 20-entry static shell cache. No response in that cache contained the unique demo edit. All observed automatic requests used the product origin.

## Claims

`.factory/claims.json` contains 33 complete entries, 33 unique tags, exactly one test per tag, no duplicate tag, and no extra tagged test. From a fresh remote clone at documentation SHA `b7c0726`, every literal `test` command was run separately. All 33 commands passed; none was inferred from a combined run.

| Claims checked | Result |
| --- | --- |
| `release-package-installs`, `package-formats`, `typescript-declarations`, `mit-license`, `zero-runtime-dependencies` | PASS |
| `package-playground`, `readme-example`, `scheduler-operations`, `resource-layout`, `collision-layout`, `month-models` | PASS |
| `four-demo-views`, `shared-demo-state`, `sample-seed`, `demo-isolation-reset` | PASS |
| `pointer-modes`, `pointer-capture-validation`, `grid-keyboard-navigation`, `keyboard-controls` | PASS |
| `iso-event-boundary`, `timezone-boundaries`, `date-adapters`, `recurrence-scope`, `release-scope` | PASS |
| `browser-primitives`, `preset-css`, `react-adapter`, `privacy-boundary`, `package-side-effects`, `headless-core` | PASS |
| `offline-demo`, `route-contract`, `static-site-artifact` | PASS |

The landing page, demo, privacy page, terms page, README, security policy, catalog line, empty/error/offline states, and installed release were checked against the registry. Public claims map to passing behavior. No false, incomplete, missing, or untested public claim was found. The copy audit has no sentence over 22 words and no banned marketing term.

The full browser suite also passed 34/34 locally and 34/34 against live.

## Clean checkout and package

Environment: Node `v22.23.2`, npm `10.9.8`. A remote clone was checked out clean at `b7c0726357fb7d86ca3daef592272fbe13b17ffb`; 150 lockfile packages were installed with scripts disabled.

| Command | Result |
| --- | --- |
| `npm test` | PASS; 32/32 unit tests |
| `npm run check` | PASS; library and site TypeScript checks |
| `npm run build` | PASS; created `dist/package` and `dist/site` |
| `npm run check:claims` | PASS; 33 claims and exact one-to-one tags |
| Every literal command in `.factory/claims.json` | PASS; 33/33 independent runs |
| `npm run test:claims` | PASS; 34/34 browser tests |
| `npm run check:pack` | PASS; clean ESM, CommonJS, React, type, CSS, timezone, month, and pointer consumers |
| `npm pack --dry-run` | PASS; 24 files, 42.2 kB packed, 146.9 kB unpacked |
| `npm run check:smoke` | PASS; phone and desktop with zero console errors |
| `npm run check:a11y` | PASS; zero violations on Home, Demo, Privacy, Terms, and 404 |
| `npm run check:headers` | PASS; ten response-policy checks |
| `npm run check:offline` | PASS; controlled offline reload |
| `npm run check:pwa-update` | PASS; old-to-new worker and cache handoff |

The installed v0.1.0 release exposes working ESM, CommonJS, optional React, declarations, and preset CSS. npm publication was not attempted because it remains operator-owned.

## Live routes, accessibility, privacy, and performance

The factory URL verifier passed in 664 ms with `lang=en`, a descriptive title, one H1, a main landmark, complete image alternatives, labelled buttons, and zero browser errors. Axe returned zero violations for Home, Demo, Privacy, Terms, and the 404 state.

Home, Demo, Privacy, Terms, the sample query, source, and license links returned successful responses. The deliberate unknown-route HTTP 404 displayed the complete “This page does not exist” page with Return home. Direct `/404.html` correctly remains a static 200 asset for the host rewrite.

Every checked route has its own title, description, canonical URL, H1, header, main, and footer. SPA navigation and Back restore H1 focus and announce the route. `robots.txt`, `sitemap.xml`, the manifest MIME type, security headers, and cache rules passed. The live offline sample reloaded under service-worker control.

Fresh Lighthouse 12.8.2 mobile results:

| Measure | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 2.0 s |
| CLS | 0 |
| TBT | 20 ms |

The build emits 55,640 bytes of entry JavaScript, 22,583 bytes of CSS, and a 198,634-byte hero WebP. These remain below the declared budgets. The intentional light paper treatment, original risograph image, type, spacing, and reduced-motion behavior match `.factory/design.md`. No analytics, telemetry, remote font, third-party script, payment code, or model request was observed.

## Candidate and live identity

There are no non-`.factory` changes from implementation `c4aa78a` through documentation base `b7c0726`. A clean build matched nine important live outputs byte for byte: root HTML, entry JavaScript, entry CSS, service worker, web manifest, v0.1.0 release archive, Privacy HTML, Terms HTML, and 404 HTML.

The implementation reviewed is therefore `c4aa78ae557c349f5c9dff7f4fdad0980b4139b7`. The later documentation base is `b7c0726357fb7d86ca3daef592272fbe13b17ffb`.

## Earlier findings

All prior review, verification, polish, repair, and handoff reports were inspected. Fresh evidence produced these dispositions:

| Earlier finding | Current disposition |
| --- | --- |
| Review 1 findings 1–5: failed install, unclear first screen, missing demo, no claims registry, broken routes | Fixed. The live archive installed in fresh consumers; both first screens, one-click sample, 33-to-33 registry, real routes, and expected HTTP 404 passed. |
| Review 1 findings 6–7: route metadata, shared structure, focus, and announcements | Fixed. Five route states, direct loads, SPA navigation, Back, focused H1, and live announcement passed. |
| Review 1 findings 8–11, including the minor title finding | Fixed. Current plain copy, required section order, 44 px mobile controls, and the 49-character descriptive home title passed. |
| Review 1 `UC-01`–`UC-14` | Fixed. MIT/package contents, four views, package-backed demo, shared state, layout, pointer, keyboard, and installed formats passed. |
| Review 1 `UC-15`–`UC-28` | Fixed. Editable offline demo, reset/isolation, core/React consumers, exact README example, input validation, complete ISO dates, DST, and non-DST boundaries passed. |
| Review 1 `UC-29`–`UC-42` | Fixed. Date adapters, recurrence scope, CSS hooks, declarations, static artifact, privacy, response policy, ES2022, ESM/CommonJS, React, and excluded-module scope passed. |
| Review 1 `UC-43`–`UC-53` | Fixed. Request/storage inspection, reset/reload/exit, package side-effect traps, immutability, layout edges, bounded keyboard navigation, adapters, and React 18/19 passed. |
| Review 2 `F-2-1`–`F-2-5` | Fixed. The exact README example, all named side-effect channels, grid edges, functional offline sample, installed MIT file, and four installed views passed. |
| Review 2 `F-2-6`–`F-2-23` | Fixed. The cited landing, demo, dialog, and README terms now use the recorded plain wording and result-naming actions. |
| Review 2 `F-2-24`–`F-2-28` | Fixed. Privacy remains in the header, the first-screen facts are complete, no npm availability claim exists, sample contents are tested, and `SECURITY.md` gives a private route. |
| Verification 1: clean pack, stale worker design, headers and caching | Fixed. Direct pack, fresh consumer, revisioned worker, update test, and ten live response checks passed. |
| Verification 2: PWA update regression and smoke focus race | Fixed. Deterministic old-to-new update, local/live smoke, dialog focus, and focus return passed. |
| Verification 3: invalid timeline slots, Temporal DST arithmetic, axe startup, manifest MIME, and 404 caching | Fixed. Invalid values reject, both DST crossings pass, axe self-starts, manifest MIME is correct, and live unknown routes are `no-store`. |
| Verification 4: default non-UTC boundaries and invalid pointer settings | Fixed. New York, Kolkata, Auckland, day/week/month, snap, and scale regressions passed in unit and installed-package checks. |
| Verification 5: resize status announced the wrong time | Fixed. Pointer and keyboard resize announce the changed end time. |
| Verification 6: resize unavailable by keyboard | Fixed. The separate, next-in-order 44 × 44-or-larger resize control changes duration and its accessible name. |
| Verification 7 and Review 3 | No finding was recorded. Their package, live, accessibility, privacy, and PWA paths passed again. |
| Review 4 `F-4-1`: positive-offset month fields | Fixed. Installed tests return correct March dates, flags, and instants for Kolkata and Auckland. |
| Review 4 `F-4-2`: Cache Storage omitted from privacy proof | Fixed. Public copy discloses the shell cache; the test inspects all 20 allowed entries and proves unique demo data is absent. |
| Review 4 `F-4-3`: untested security acknowledgment | Fixed. No response-time or acknowledgment promise remains. |
| Review 4 `F-4-4`: metaphorical 404 and dialog labels | Fixed. Live copy uses “Page not found,” “This page does not exist,” and “New event.” |
| Repair 8 and Verification 8 | No finding remains. Their repaired paths all passed again in this review. |

No earlier finding is deferred or reopened.

## Not applicable

This is a static documentation site and npm library. It has no backend, tenant state, shared or product SQLite data, health endpoint, authenticated request, rate limit, payment flow, or account system. Backend tenant-isolation, restart-persistence, and 429 checks do not apply. The deterministic calendar-layout job does not gain an obvious missing step from an AI feature, import, export, or hosted sync; those additions would exceed the documented v0.1 scope.

## Findings

None.
