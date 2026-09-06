# Verification 8: Build calendar and resource timeline UIs — PASS

- Date: 2026-09-06
- Work order: `headless-scheduler-verify-8`
- Live URL: <https://headless-scheduler.sociobot.in>
- Implementation reviewed: `c4aa78ae557c349f5c9dff7f4fdad0980b4139b7`
- Documentation and evidence base: `b2a28a3ef14ab508bc02d9e0ec1e87cbb78ade5a`

## Verdict

**PASS.** Finding count: **0**. Untested claim count: **0**.

The live product, package, demo sandbox, offline behavior, accessibility, privacy boundary, and recovery paths pass. All 33 declared claim commands passed independently from a clean remote clone. The complete browser suite also passed 34/34 locally and 34/34 against the live site.

No product code was changed. This report, its evidence, and the handoff update are the only repository changes.

## First screen before scrolling

Fresh 390 × 844 phone and 1440 × 900 desktop browser contexts started at the top of the live page. Both showed the required information before scrolling:

| Question | Visible answer |
| --- | --- |
| Job | “Build calendar and resource timeline UIs” |
| Audience | “For product engineers who need scheduling behavior without adopting another component library.” |
| First action | “Try it with sample data” |
| Action result | “Opens an editable resource timeline in this page.” |
| Three facts | Free under MIT; demo data stays in this tab; demo works offline after the first visit |

The headline names the job in six words. The audience sentence is 12 words. The action and all three facts fit in both first viewports. There was no page-level horizontal overflow or console error. Evidence: `evidence/verification-8/cold-phone.png`, `cold-desktop.png`, and `verify/`.

## Demo and user paths

The primary action entered `/?demo=1` in one click and immediately showed an editable resource timeline. The sample contained Studio A, Maya Chen, Morning briefing, Prototype review, and the other documented room, person, and work records.

The persistent label read “Demo — sample data, nothing is saved.” Reset demo and Start for real — install the package remained available.

Fresh phone and desktop runs passed these paths:

- Normal: edit the sample JSON, switch all four views, add an event, move and resize by keyboard, remove, and undo.
- Invalid: submit a blank title and malformed JSON. Both errors were plain, announced, and bound to their fields.
- Boundary: create an event at 23:59; test clipped ranges, grid edges, DST, non-DST, and positive-offset months through the package tests.
- Recovery: correct invalid input, reset to the original five events, reload, leave the demo, and re-enter with the seed restored.
- Keyboard: first Tab reaches the skip link; dialog focus moves to the title; route changes and Back focus and announce the H1; event move and resize use 15-minute steps.
- Touch and layout: the live 390 px suite found no visible control below 44 × 44 CSS pixels. The timeline scrolls inside its own region without document overflow.
- Reduced motion: the media query matched, document scrolling became `auto`, and animation and transition durations became `0.00001s`.

Cookies, localStorage, sessionStorage, and IndexedDB remained empty. One same-origin Cache Storage shell contained exactly 20 GET entries. No cached response contained the unique demo edit. Every observed request used `https://headless-scheduler.sociobot.in`.

Evidence: `evidence/verification-8/live-browser.json`, `demo-phone.png`, and `demo-desktop.png`.

## Claims

`.factory/claims.json` has 33 entries, 33 unique tags, no duplicate tag, no missing tag, and no extra tag. From fresh clone `/tmp/headless-scheduler-verify8.Whsq3l`, every literal `test` command in the registry ran separately and passed. The independent matrix also passed 33/33. No claim was accepted from a combined suite alone.

| Claims checked | Result |
| --- | --- |
| `release-package-installs`, `package-formats`, `typescript-declarations`, `mit-license`, `zero-runtime-dependencies` | PASS |
| `package-playground`, `readme-example`, `scheduler-operations`, `resource-layout`, `collision-layout`, `month-models` | PASS |
| `four-demo-views`, `shared-demo-state`, `sample-seed`, `demo-isolation-reset` | PASS |
| `pointer-modes`, `pointer-capture-validation`, `grid-keyboard-navigation`, `keyboard-controls` | PASS |
| `iso-event-boundary`, `timezone-boundaries`, `date-adapters`, `recurrence-scope`, `release-scope` | PASS |
| `browser-primitives`, `preset-css`, `react-adapter`, `privacy-boundary`, `package-side-effects`, `headless-core` | PASS |
| `offline-demo`, `route-contract`, `static-site-artifact` | PASS |

The landing page, demo, privacy page, terms page, README, security policy, and catalog line were checked against the registry. Every statement a visitor could rely on maps to a passing claim. No unlisted, false, incomplete, or untested public claim was found. The copy audit has no sentence over 22 words and no banned marketing term.

Evidence: `evidence/verification-8/exact-claim-commands.log` and `claim-matrix-clean.json`.

## Clean checkout and package

Environment: Node `v22.23.2`, npm `10.9.8`. The remote clone was clean at `b2a28a3` before dependency installation.

| Command | Result |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS; 150 lockfile packages installed |
| `npm test` | PASS; 32/32 unit tests |
| `npm run check` | PASS; library and site TypeScript checks |
| `npm run build` | PASS; `dist/package` and `dist/site` created |
| `npm run check:claims` | PASS; 33 claims and exact one-to-one tags |
| Every command in `.factory/claims.json` | PASS; 33/33 separate invocations |
| `npm run test:claims:each` | PASS; 33/33 separate claim tests |
| `npm run test:claims` | PASS; 34/34 browser tests |
| `npm run check:pack` | PASS; fresh ESM, CommonJS, React, type, CSS, date, and pointer consumer |
| `npm pack --dry-run` | PASS; 24 files, 42.2 kB packed, 146.9 kB unpacked |
| `npm run check:smoke` | PASS; phone and desktop, zero console errors |
| `npm run check:a11y` | PASS; zero violations on Home, Demo, Privacy, Terms, and 404 |
| `npm run check:headers` | PASS; 10 response-policy checks |
| `npm run check:offline` | PASS; controlled offline reload |
| `npm run check:pwa-update` | PASS; old-to-new worker and cache handoff |

The installed release archive exposes working ESM, CommonJS, optional React, declarations, and preset CSS. The fresh consumer also passed the New York DST, Kolkata and Auckland month, and invalid pointer-setting regressions. npm publication was not attempted because it belongs to the operator.

## Live site, accessibility, privacy, and performance

The live full claim suite passed 34/34. Live smoke passed add, pointer resize, keyboard move and resize, month navigation, both viewports, accurate status text, and zero console errors.

The factory URL verifier passed with `lang=en`, a descriptive title, one H1, a main landmark, complete image alternatives, labelled buttons, and no browser errors. Axe reported zero violations on Home, Demo, Privacy, Terms, and the 404 state. The deliberate unknown-route HTTP 404 is expected and displayed a complete designed page with a Return home action.

Home, Demo, Privacy, Terms, the query demo, source, and license links returned 2xx. `robots.txt` and `sitemap.xml` are valid and list all public routes. Each route has its own title, description, canonical, H1, shared header, main, and footer.

The live host passed all security and cache checks. HTML, deep links, and the 404 are `no-store`; hashed JS and CSS are one-year immutable; the service worker is `no-cache, no-store, must-revalidate`; the manifest has `application/manifest+json`. CSP, HSTS, frame denial, `nosniff`, referrer, permissions, opener, and resource policies are present.

Fresh Lighthouse 12.8.2 mobile results:

| Measure | Result |
| --- | ---: |
| Performance | 98 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 2.130 s |
| CLS | 0 |
| TBT | 68 ms |

The candidate build emits 55,640 bytes of entry JavaScript, 22,583 bytes of CSS, and a 198,634-byte hero WebP. Gzip sizes are 19,597 bytes for JS and 5,702 bytes for CSS. These meet the stated budgets. The intentional single light treatment and original risograph asset match `.factory/design.md`; no remote font, third-party script, analytics, telemetry, or payment code loaded.

Evidence: `evidence/verification-8/axe-live.json`, `axe-local.json`, `lighthouse-live.json`, and `verify/verify.json`.

## Candidate and live identity

A clean archive of implementation `c4aa78a` was installed and built independently. Nine important outputs matched the live host byte for byte: root HTML, entry JS, entry CSS, service worker, manifest, v0.1.0 release archive, Privacy HTML, Terms HTML, and 404 HTML.

The diff from `c4aa78a` through documentation SHA `b2a28a3` contains only `.factory` reports and evidence. There is no later product-source change. The current live metadata uses the default build label `release`, so identity was established through byte comparison rather than treating that label as a commit SHA.

## Earlier findings

Every earlier review, verification, polish report, repair report, and handoff was read. The table records fresh disposition evidence rather than relying on the earlier status.

| Earlier finding | Current disposition and fresh evidence |
| --- | --- |
| Review 1 findings 1–5: install, first screen, demo, claim registry, routes | Fixed. Live archive installed in fresh consumers; cold phone/desktop, one-click demo, 33-to-33 registry, real routes, and HTTP 404 passed. |
| Review 1 findings 6–7: metadata, shared structure, route focus and announcement | Fixed. Five route states, direct loads, SPA navigation, Back, focused H1, and live announcement passed. |
| Review 1 findings 8–11: wording, page order, mobile targets, title | Fixed. Current copy audit, visual captures, 44 px scan, first-screen bounds, and 49-character home title passed. |
| Review 1 `UC-01`–`UC-14` | Fixed. MIT/package contents, four views, package-backed demo, shared state, layout, pointer, keyboard, and installed formats all passed. |
| Review 1 `UC-15`–`UC-28` | Fixed. Editable offline demo, reset/isolation, core/React consumers, README example, input validation, complete ISO dates, DST and non-DST boundaries passed. |
| Review 1 `UC-29`–`UC-42` | Fixed. Date adapters, recurrence scope, CSS hooks, strict declarations, static artifact, privacy, response policy, ES2022, ESM/CJS, React, and excluded-module scope passed. |
| Review 1 `UC-43`–`UC-53` | Fixed. Same-origin/storage inspection, reset/reload/exit, package side-effect traps, immutability, layout edges, keyboard bounds, adapters, and React 18/19 passed. |
| Review 2 `F-2-1`–`F-2-5` | Fixed. Exact README extraction, side-effect traps, grid edges, editable offline sample, installed license, and four installed views passed. |
| Review 2 `F-2-6`–`F-2-23` | Fixed. Current landing, demo, dialog, and README use the recorded plain terms and result-naming actions. |
| Review 2 `F-2-24`–`F-2-28` | Fixed. Privacy is in the header, the three required facts are visible, npm availability is not claimed, sample contents are tested, and `SECURITY.md` gives a private route. |
| Verification 1: broken clean pack, stale worker design, missing headers/cache policy | Fixed. Direct pack, fresh consumer, deterministic PWA update, and live response checks passed. |
| Verification 2: PWA update regression and smoke focus race | Fixed. `check:pwa-update`, local/live smoke, dialog focus, and focus return passed. |
| Verification 3: invalid timeline slots, Temporal DST arithmetic, axe startup, manifest MIME, 404 caching | Fixed. Unit/consumer regressions reject invalid slots, Temporal crosses both DST changes correctly, axe self-starts, manifest MIME is correct, and live 404 is `no-store`. |
| Verification 4: native non-UTC boundaries and invalid pointer settings | Fixed. Unit, claim, and installed-consumer checks passed for day/week/month, Kolkata/Auckland month fields, snap values, and scale values. |
| Verification 5: resize status announced the wrong time | Fixed. Pointer and keyboard resize announce the changed end time. |
| Verification 6: resize unavailable by keyboard | Fixed. The separate resize control is next in keyboard order, at least 44 × 44 px, changes duration, and updates its accessible name. |
| Verification 7 and Review 3 | They reported no open findings. Their package, route, privacy, offline, accessibility, and browser paths passed again. |
| Review 4 `F-4-1`: positive-offset month data | Fixed. Installed-package tests return March days 1–31, correct outside/today flags, and correct Kolkata/Auckland instants. |
| Review 4 `F-4-2`: Cache Storage missing from privacy proof | Fixed. Public copy discloses the static shell; the test inspects its 20-entry allowlist and proves unique demo data is absent. |
| Review 4 `F-4-3`: untested security acknowledgment | Fixed. No response-time promise remains; private reporting instructions are direct. |
| Review 4 `F-4-4`: metaphorical 404 and dialog labels | Fixed. Live labels are “Page not found,” “This page does not exist,” and “New event.” |

No earlier finding is deferred or reopened.

## Not applicable

This product is a static documentation site plus an npm library. It has no backend, tenant data, SQLite state, health endpoint, live model request, rate limit, payment flow, or account system. Backend tenant-isolation, restart-persistence, and 429 checks therefore do not apply. An AI feature would not help the deterministic calendar-layout job and is not implied by the brief.

## Findings

None.

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
CLAIMS_BASE_URL=https://headless-scheduler.sociobot.in npm run test:claims
npm run check:smoke -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in /tmp/verification-8-axe-live.json
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:offline -- https://headless-scheduler.sociobot.in
```
