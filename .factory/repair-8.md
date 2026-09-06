# Repair 8 — finding closure

Date: 2026-09-06
Work order: `headless-scheduler-repair-8`
Implementation SHA: `c4aa78ae557c349f5c9dff7f4fdad0980b4139b7`
Live URL: <https://headless-scheduler.sociobot.in>

## Result

All four findings in `.factory/review-4.md` are closed. The final implementation is pushed, deployed, and byte-identical to the files served by the product domain. All earlier review and verification findings remain closed.

## Review 4 findings

| Finding | Repair | Outcome evidence |
| --- | --- | --- |
| F-4-1: positive-offset month data | `buildMonth` now derives its key, day number, outside flag, and today flag through the configured adapter and time zone. | Unit and installed-package tests return March 2026, days 1–31, and the correct first instant in Kolkata and Auckland. `npm run check:pack` exercises the same result from a fresh consumer. |
| F-4-2: Cache Storage omitted from privacy proof | The claim now says that the site stores no user data. The privacy page discloses the static offline cache. The claim test inspects the exact 20-entry static allowlist while a unique edit is active, rejects other caches or entries, and proves that no cached response contains the edit. | The clean claim matrix and live 34-test run pass. Cookies, localStorage, sessionStorage, and IndexedDB remain empty before and after reset. |
| F-4-3: untestable security acknowledgment | Removed the promise of a future human acknowledgment. The private reporting address and required report contents remain. | `SECURITY.md` contains no response-time or acknowledgment promise. |
| F-4-4: metaphorical labels | Replaced the 404 copy with “Page not found” and “This page does not exist.” Replaced “New paper slip” with “New event.” | Live route test receives an intentional HTTP 404 and direct labels. The dialog test finds “New event.” The copy audit includes every replacement. |

The date-fns adapter also keeps combined weekday-and-day labels while supporting the new calendar-field reads. A dedicated unit regression fails if a day-only format shadows a weekday label.

## Earlier findings

| Earlier report | Current disposition |
| --- | --- |
| Review 1 findings 1–11 and UC-01–UC-53 | Fresh release installation, 33 one-to-one claims, first-screen checks, demo isolation, real routes, route focus, metadata, plain copy, target sizes, and the package API all pass. |
| Review 2 findings F-2-1–F-2-28 | The exact README example, package side-effect traps, grid edges, editable offline demo, installed MIT file, plain terminology, Privacy navigation, sample claim, and private security route all pass. |
| Verification 1–3 | Clean packing, revisioned service-worker updates, security/cache headers, reliable axe startup, slot validation, Temporal DST arithmetic, manifest type, and 404 cache policy all pass. |
| Verification 4 | Native non-UTC day/week/month boundaries and invalid pointer settings pass in unit, claim, and fresh-consumer tests. |
| Verification 5–6 | Pointer and keyboard resize both change the end time and announce the correct result. The keyboard control is reachable and at least 44 px. |
| Verification 7 and Review 3 | Their passing paths were rerun locally and live. Review 4's later month, privacy, promise, and copy findings are the repairs recorded above. |

## Clean verification

The final SHA was cloned into `/tmp/headless-scheduler-repair8-final.WqKxZA`. From that clean checkout:

- `npm ci --ignore-scripts --no-audit --no-fund` installed 150 lockfile packages.
- `npm test` passed 32/32 tests.
- `npm run check`, `npm run build`, and `npm run check:claims` passed. The build created `dist/package` and `dist/site`.
- `npm run test:claims:each` passed all 33 declared commands independently in 114 seconds.
- `npm run check:pack` installed the tarball in a fresh ESM/CommonJS/React consumer and passed the native timezone, positive-offset month, and pointer validation regressions.
- `npm pack --dry-run` produced 24 files, 42.2 kB packed and 146.9 kB unpacked.
- `npm run check:headers`, `check:offline`, `check:smoke`, `check:a11y`, and `check:pwa-update` passed locally.

The built entry JavaScript is 55,640 bytes raw and 19,683 bytes gzip. CSS is 22,583 bytes raw and 5,676 bytes gzip. The hero WebP is 198,634 bytes.

## Live verification

- The live build marker is `c4aa78a`. Local and live SHA-256 values match for `index.html`, JavaScript, CSS, `sw.js`, the manifest, and the v0.1.0 release file.
- All 34 live Playwright tests pass: 33 registered claims plus the mobile interaction baseline.
- Fresh 390 × 844 and 1440 × 900 contexts show the job, audience, primary sample action, and three facts before scrolling.
- The one-click demo shows Studio A and Morning briefing. Its sample label persists through an invalid blank title, recovery, a 23:59 boundary event, JSON editing, and reset. Reset restores the five-event seed.
- Fresh demo contexts leave cookies, localStorage, sessionStorage, and IndexedDB empty. The claim test allows only the disclosed static Cache Storage shell and finds no sample edit in it.
- Live smoke passes pointer resize, keyboard movement and resize, month navigation, both viewports, and zero console errors.
- Axe reports zero violations on Home, Demo, Privacy, Terms, and 404. The factory URL verifier reports one H1, `lang=en`, a main landmark, complete image alternatives, labelled controls, and zero errors.
- Home, Demo, Privacy, Terms, robots, sitemap, source, and license links return 2xx. The designed unknown route returns the expected HTTP 404.
- Live response policy passes all ten header checks. Offline reload and service-worker control pass.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 2.119 s, CLS 0, TBT 24 ms.

## Remaining scope

No defect remains from the reviewed scope. The package is ready to publish but was not published to npm because registry publication belongs to the factory operator. The tested v0.1.0 release file remains available from the product site. Vue/Svelte adapters, recurrence expansion, iCal parsing, printing, and a hosted builder remain the brief's stated post-v1 work. There is no backend, tenant state, payment offer, or external integration for this free static library.
