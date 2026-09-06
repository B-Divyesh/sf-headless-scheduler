# Review 4: Build calendar and resource timeline UIs — FAIL

Date: 2026-09-06
Live URL: <https://headless-scheduler.sociobot.in>
Implementation candidate: `980429e3b36a5a6cfd7413d4c737b54ae6dabf0a`
Documentation reviewed: `12627ec45f38dcdaafde3e04f89f628eb3414e61`

## Verdict

**FAIL.** Four findings remain: one P1 library defect, one major claim/privacy defect, and two minor copy or claim defects. Two public claims are untested or incompletely tested. A PASS requires zero findings at every severity and zero untested claims.

The live static files match a fresh build of the implementation candidate byte for byte. Commits after `980429e` changed only review, handoff, and evidence files, so a newer product image is not expected.

## Findings

### F-4-1 — P1: month data is wrong in positive-offset time zones

The installed live package calculates the right zoned month boundary, then uses UTC fields to build `MonthModel.key`, `dayNumber`, `outside`, and `today`. This moves displayed dates back one day in time zones east of UTC.

Fresh consumer reproduction against the downloaded v0.1.0 release file:

| Time zone | Requested and labelled month | Returned key | First day marked inside the month |
| --- | --- | --- | --- |
| UTC | March 2026 | `2026-03` | day 1 at `2026-03-01T00:00:00.000Z` |
| America/New_York | March 2026 | `2026-03` | day 1 at `2026-03-01T05:00:00.000Z` |
| Asia/Kolkata | March 2026 | `2026-02` | day 22 at `2026-02-22T18:30:00.000Z` |
| Pacific/Auckland | March 2026 | `2026-02` | day 22 at `2026-02-22T11:00:00.000Z` |

The March label and February key disagree. The first local day shown as inside March is also wrong. The cause is the UTC slicing and UTC getters in `buildMonth` at `src/layout.ts:88-100` after the adapter has returned a zoned-midnight instant.

This blocks release because month views are a core job and timezone correctness is an explicit product constraint. Derive calendar fields through the configured adapter and time zone. Add installed-package tests for `key`, `dayNumber`, `outside`, and `today` in at least Asia/Kolkata and Pacific/Auckland.

### F-4-2 — Major: the privacy claim ignores persistent Cache Storage

The registered `privacy-boundary` claim says the site “writes no cookies or persistent app storage.” A fresh live demo visit created the persistent cache `headless-scheduler-docs-6e15b356a1b6e3eb` with 20 pages and assets, including `/demo`, the JavaScript bundle, and the package archive.

The tagged test at `tests/claims.spec.ts:323-333` checks cookies, localStorage, sessionStorage, and IndexedDB, but never checks Cache Storage. The registered sandbox at `.factory/claims.json:192-197` also omits it. The separate offline claim confirms that this cache exists, so the two registered claims contradict each other.

No schedule or demo edit was found in the cache, and the offline cache is useful. Narrow the privacy claim to “no persistent user data,” disclose the same-origin offline cache on the privacy page, and make the test inspect and allow only the expected static cache entries. This claim is counted as incompletely tested.

### F-4-3 — Minor: the security policy has an unlisted promise

`SECURITY.md:5` says, “The maintainer will acknowledge the report privately.” No claim entry or test covers that public service promise. An automated product test cannot honestly prove a future human response. Remove the promise or replace it with a process that has verifiable ownership and timing. This is counted as one untested public claim.

### F-4-4 — Minor: the 404 and dialog use metaphorical labels

The live 404 uses “Misfiled paper slip” and “This page is not on the board.” The add-event dialog uses “New paper slip.” These violate the supplied plain-words rule against metaphor and mood labels. The current copy audit lists the 404 sentence without flagging it and omits the two “paper slip” labels.

The 404 itself is deliberate and correct: it returns HTTP 404, has route metadata, uses the product design, and offers Return home. Only its wording is a defect. Use direct labels such as “Page not found,” “This page does not exist,” and “New event.”

## First screen before scrolling

Fresh Chromium contexts at 390 × 844 and 1440 × 900 gave the same answers before scrolling:

| Question | Answer shown | Result |
| --- | --- | --- |
| Job | “Build calendar and resource timeline UIs” | Pass |
| Audience | Product engineers who need scheduling behavior without another component library | Pass |
| First action | “Try it with sample data” | Pass |

The action says that it opens an editable resource timeline. The free, isolated-demo, and offline facts fit in both first viewports. Neither viewport had page overflow or console errors.

## Demo and live product exercise

The first action opened `/?demo=1` in one click. The first demo screen showed four named room/person resources and scheduled work. The banner “Demo — sample data, nothing is saved” stayed visible and included Reset demo and Start for real — install the package.

The following live paths passed on phone and desktop:

- Edit the sample JSON and see the event update.
- Reset and reload restore the original five events.
- Exit removes the demo state and banner, then focuses the home heading.
- Invalid JSON, an unknown resource, and a blank event title show actionable errors; corrected input succeeds.
- A 23:59 boundary event is accepted with accurate feedback.
- Keyboard move, keyboard resize, pointer resize, Delete, Undo, and all four views work.
- The dialog focuses its title field, traps focus through the native modal, closes with Escape, and returns focus to Add event.
- The month grid accepts arrow navigation. Reduced motion changes smooth scrolling to `auto` and transitions to `0.00001s`.
- All visible phone controls are at least 44 × 44 CSS px. No browser, page, or console error occurred.
- Requests stayed same-origin. Cookies, localStorage, sessionStorage, and IndexedDB stayed empty. Cache Storage contained only the offline shell described in F-4-2.

The direct 404 response was treated as expected behavior, not an HTTP defect. Privacy and Terms returned 200. Route navigation and Back updated the title, focused the new H1, and updated the polite announcement. Every home-page product and GitHub link returned 2xx.

This is a static npm library and documentation site. Tenant isolation, server restart persistence, backend health, and 429/Retry-After behavior do not apply. The live root returned 200 and all ten static response-policy checks passed.

## Claims

From clean clone `/tmp/headless-scheduler-review-4-7G7atQ`, `npm run check:claims` found 33 entries and 33 unique tags. `npm run test:claims:each` ran each declared command in a separate Playwright process. All 33 processes exited 0 in 102.956 seconds.

| Claims | Process result | Review result |
| --- | --- | --- |
| release-package-installs, package-formats, typescript-declarations, mit-license, zero-runtime-dependencies | Pass | Adequate |
| package-playground, readme-example, scheduler-operations, resource-layout, collision-layout, month-models | Pass | Adequate for their exact wording; F-4-1 is a missing timezone combination |
| four-demo-views, shared-demo-state, sample-seed, demo-isolation-reset | Pass | Adequate |
| pointer-modes, pointer-capture-validation, grid-keyboard-navigation, keyboard-controls | Pass | Adequate |
| iso-event-boundary, timezone-boundaries, date-adapters, recurrence-scope, release-scope | Pass | Adequate for their exact wording; F-4-1 remains outside the narrow day-boundary claim |
| browser-primitives, preset-css, react-adapter | Pass | Adequate |
| privacy-boundary | Pass | **Incomplete and contradicted by Cache Storage — F-4-2** |
| package-side-effects, headless-core, offline-demo, route-contract, static-site-artifact | Pass | Adequate |

The separate unlisted security-response promise is F-4-3. Therefore the report records two untested or incompletely tested public claims even though every declared process exited successfully.

## Earlier findings

All earlier review, polish, verification, and handoff reports were inspected. These dispositions come from this review's fresh clone and live checks.

| Earlier finding | Current evidence | Disposition |
| --- | --- | --- |
| Review 1 #1: advertised install failed | Live release file installed and ran in clean ESM and CommonJS consumers | Fixed |
| Review 1 #2: unclear first screen | Job, audience, first action, and three facts visible at both sizes | Fixed |
| Review 1 #3: missing demo sandbox | One-click package demo, label, reset, exit, reload clearing, and isolated edits passed | Fixed |
| Review 1 #4: no claims system | 33 entries map one-to-one to 33 tags and all processes pass; F-4-2 is a new adequacy failure | Structurally fixed; new finding |
| Review 1 #5: broken routing | `/demo`, `/privacy`, and `/terms` return 200; an unknown route returns designed 404 | Fixed |
| Review 1 #6: metadata/legal skeleton | Route titles, canonical data, shared header/footer, Privacy, Terms, icons, and social metadata present | Fixed |
| Review 1 #7: route focus/announcements | Forward and Back focus H1 and update the live region | Fixed |
| Review 1 #8: jargon/metaphor copy | Original landing wording is fixed; overlooked 404/dialog metaphors remain in F-4-4 | Reopened in a smaller scope |
| Review 1 #9: missing landing sections | Preview, three steps, scope/privacy, install, API, and footer present | Fixed |
| Review 1 #10: small mobile targets | Fresh audit found zero visible targets below 44 × 44 | Fixed |
| Review 1 #11, minor: long marketing title | Home title is 49 characters and names the function | Fixed |
| Review 1 UC-01–UC-42 and UC-44–UC-53 | Installed-package, API, interaction, date, route, demo, and claim matrix checks pass | Fixed for their recorded scope |
| Review 1 UC-43: site privacy boundary | Persistent Cache Storage is omitted by the registered test | Reopened as F-4-2 |
| Review 2 F-2-1–F-2-5 | README example, package side effects, grid edges, offline edits, and installed MIT file are directly asserted | Fixed |
| Review 2 F-2-6–F-2-23 | The cited landing/README terms and action labels are fixed; F-4-4 is separate residual copy | Fixed for the cited strings |
| Review 2 F-2-24–F-2-28 | Privacy is in the header, first facts are complete, sample has a claim, and SECURITY.md provides an address | Fixed; SECURITY.md adds F-4-3 |
| Verification 1: clean pack failure | `prepack`, `check:pack`, dry run, and live clean consumer pass with all 24 files | Fixed |
| Verification 1 and 2: stale service worker/update failure | Offline reload and deterministic old-to-new update checks pass | Fixed |
| Verification 1 and 3: headers, cache rules, manifest MIME | All ten local and live header checks pass | Fixed |
| Verification 2: smoke focus race | Current smoke waits for focus and passes twice locally and live | Fixed |
| Verification 3: accessibility runner needs a server | Current command starts its own static server; five routes have zero axe violations | Fixed |
| Verification 3: invalid slot value can hang | Zero, negative, NaN, and Infinity reject; unit and claim tests pass | Fixed |
| Verification 3: Temporal DST error | Spring and fall Temporal tests pass | Fixed |
| Verification 4: default non-UTC day boundaries | New York and Kolkata day boundaries pass; month rendering still fails in F-4-1 | Partly fixed; new month defect |
| Verification 4: invalid pointer settings | All invalid snap and scale values reject at construction | Fixed |
| Verification 5: wrong resize result text | Pointer and keyboard resize announce the changed end time | Fixed |
| Verification 6: no keyboard resize | Dedicated 44 × 48 control is reachable and works | Fixed |
| Verification 7 and Review 3 PASS reports | Their recorded paths still pass; this review adds four newly demonstrated findings | Superseded |

## Build, accessibility, privacy, and performance evidence

| Check | Result |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` in clean clone | Pass; 150 packages installed |
| `npm test` | Pass; 29/29 |
| `npm run check` | Pass |
| `npm run build` | Pass; `dist/package` and `dist/site` created |
| `npm run check:pack` | Pass; ESM, CommonJS, React, time-zone regression, pointer validation, seven targets |
| `npm pack --dry-run` | Pass; 24 files, 40.5 kB packed, 141.6 kB unpacked |
| `npm run check:smoke` local and live | Pass at 390 × 844 and 1440 × 900; zero console errors |
| `npm run check:a11y` local and live | Pass; zero axe violations on Home, Demo, Privacy, Terms, and 404 |
| `npm run check:headers` local and live | Pass; ten checks each |
| `npm run check:offline` local and live | Pass |
| `npm run check:pwa-update` | Pass |
| Factory `verify-url.sh` | Pass; title, `lang=en`, one H1, main, alt text, labels, zero console errors |
| Lighthouse mobile | 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 2.127 s, CLS 0, TBT 70 ms |

Built entry JavaScript is 55,078 bytes raw and 19,380 bytes gzip. CSS is 22,583 bytes raw and 5,702 bytes gzip. The hero WebP is 198,634 bytes. All are inside the supplied budgets.

Fresh local and live SHA-256 values match:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `e19b09ebfd919c15b92780fec5f29be9211c3c8a8dcc46b97552c36065d9cb74` |
| `assets/index-CQmFBLL1.js` | `7f07d3bb1a0be1c2a518715949f73d031cd13610731e2d9976eaa44efd9770af` |
| `assets/index-Dfw04gbk.css` | `06dd87bdb679cbb22169b19f5d4989a97d214aa36af0244b361dd4577b01748a` |
| `sw.js` | `989166813f389ed4d24594ce125d4eeb1b16bf6d95101095bdd677a1e8672333` |
| `manifest.webmanifest` | `29cb3e92c00d82a7d836f560587e00635f4e113f6c65844c692a1a96c7235ac0` |
| `headless-scheduler-0.1.0.tgz` | `2ee584d747b1bdd4553a3245de29184817e80850283633ee7676e26d56f49f50` |

## Missed feature check

No missing AI, import/export, or sync feature is a finding. This product supplies scheduling calculations and interaction helpers. Recurrence expansion, iCal, printing, hosted storage, and Vue/Svelte adapters are explicitly outside version 0.1. Adding hosted intelligence would conflict with the small headless-library scope.

## Required next work

1. Fix zoned month fields and add installed-package positive-offset tests.
2. Correct and strengthen the persistent-storage claim and privacy disclosure.
3. Remove or make the security acknowledgment promise verifiable.
4. Replace the three metaphorical labels with direct wording and update the copy audit.
5. Re-run every claim separately and repeat the clean live review. Do not mark PASS until all four findings and both untested claims are closed.
