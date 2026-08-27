# Independent verification 3 — FAIL

Date: 2026-08-27  
Candidate: `c1c41faebe3f42c0223ef13653dcdbc786d0edd7`  
Live URL: <https://headless-scheduler.sociobot.in>

## Verdict

**FAIL — do not release this npm library.** The deployed documentation site is
healthy and is an exact byte match for this candidate, but two core public-API
boundary cases violate the brief's timezone-correct scheduling contract and
can indefinitely consume a consumer's JavaScript thread. These are library
defects, not the earlier deployment-only PWA failure. No product source was
changed during verification.

## Clean candidate / package evidence

A detached clean clone of the requested SHA was created at
`/tmp/headless-scheduler-verify-CMhbQH`, using Node `v22.23.2` and npm
`10.9.8`. `npm ci` installed 145 packages and reported 0 vulnerabilities.

| Check | Result | Exact evidence |
| --- | --- | --- |
| `npm test` | PASS | Vitest: 1 file, 10/10 tests. |
| `npm run check` | PASS | Both library and site TypeScript projects. No lint script exists. |
| `npm run build` | PASS | `dist/package` and `dist/site` produced; worker precache has 12 entries. |
| `npm run check:pack` | PASS | Fresh temporary consumer installed packed tarball; core and React imports worked in ESM and CJS; all 7 declared artifacts existed. |
| `npm pack --dry-run` | PASS | Publishable `headless-scheduler-0.1.0.tgz`, 30.5 kB packed / 122.9 kB unpacked, 24 files. |
| `npm run check:smoke` | PASS | Self-hosted 390 x 844: add-event, keyboard move, month navigation, 0 console errors. |
| `npm run check:headers` | PASS | 8 local production-header checks. |
| `npm run check:offline` | PASS | Service-worker-controlled offline shell reload. |
| `npm run check:pwa-update` | PASS | Deterministic old-to-new worker cache handoff and new-shell offline reload. |

`npm run check:a11y` **fails as written** from the clean checkout with
`net::ERR_CONNECTION_REFUSED` because it assumes an already-running
`127.0.0.1:4173` server. This is a P2 automation defect, not an axe result:
the exact built production site was independently served and checked with its
same axe-core WCAG 2 A/AA + 2.1 AA configuration; it had **zero violations**.
The live site also had zero axe violations.

The Docker production-container check could not be run because this verifier
environment has no `docker` executable. The exact static production build,
its PWA behavior, and its live deployment were tested instead.

## End-to-end browser exercise

The built production site was exercised with Playwright at 1440 x 900 and
390 x 844, including keyboard-only paths and `prefers-reduced-motion: reduce`.

- Normal flow passed: timeline pointer drag moved Morning briefing from
  08:30–10:00 to 09:00–10:30; Day, Week, Month and Timeline views switched;
  Delete removed the focused event; Undo restored it.
- Invalid/recovery flow passed: an empty event title announced “Add a title so
  people know what is scheduled.”; correcting it closed the dialog and added
  the event. A 23:59 start is accepted; it is outside the displayed 07:00–17:00
  timeline, so naturally is not visible until the range changes.
- Keyboard passed: event arrow movement, month `PageDown` navigation (focused
  cell became index 42), modal initial focus, and Tab focus all worked. The
  keyboard-focused Add event button rendered a solid 3px outline.
- No horizontal document overflow occurred: 1440/1440 desktop and 390/390
  mobile scroll/client widths. The visible Add event target measured
  151.0 x 44.8 CSS px on mobile.
- Reduced-motion media query was active and event transition/animation values
  became `0.00001s`. Browser page/console errors were zero.
- Semantic smoke passed: `lang=en`, one title, one `<h1>`, one `<main>`, and a
  skip link. Axe found zero serious/critical (indeed zero total) violations.

## Blocking core defects

1. **P1 — `slotMinutes: 0` can hang the scheduler forever.**
   `buildResourceTimeline` accepts `slotMinutes` without validating it, then
   advances its slot cursor by that value. A clean built-package invocation
   with a one-hour range and `slotMinutes: 0` was terminated only by
   `timeout 3`, exit `124`; the loop never advances. Negative values likewise
   move backwards. A normal boundary/invalid configuration must reject with a
   `RangeError`, not freeze the consumer UI/server. The test suite covers only
   a valid value of 60.

2. **P1 — Temporal date adapter produces a one-hour wrong calendar date over
   DST.** The public README says `timeZone` controls calendar boundaries and
   offers a Temporal adapter. Against the real
   `@js-temporal/polyfill@0.5.1`, starting in `America/New_York` on the US
   2026 spring-forward day produced the correct start
   `2026-03-08T05:00:00.000Z`, but `adapter.addDays(start, 1)` produced
   `2026-03-09T05:00:00.000Z`; the next New York calendar midnight is
   `2026-03-09T04:00:00.000Z`. The implementation converts additions through
   the hard-coded `UTC` timezone, so month/week calendar generation can drift
   an hour across DST. This directly fails the researched brief's timezone
   correctness constraint.

## Live deployment, privacy, response policy, and performance evidence

The live deployment matches this candidate byte-for-byte, eliminating a
deployment mismatch:

| File | SHA-256 local = live |
| --- | --- |
| `index.html` | `e922952b296ee081a67b6179d4853cfdeaa90495267e52f8a2e654f161fd1198` |
| `assets/index-DUheX0I6.js` | `9bdc94d2ac21560828e4f4b38a005760c717b6f1c9757c732eac8153a1012394` |
| `assets/index-D1Xy_nRN.css` | `831db0b0822793d06751eeddfc37a2d8514940c879244d8ef0f17da0ed094039` |
| `sw.js` | `eda4a45e3f33bcad8542bef49693359c286116d3b55db438d52a35e0a8a33def` |

The live URL registered `/sw.js`, then successfully reloaded offline with its
H1 present. First-load browser requests were same-origin only. Source/bundle
scan found no analytics, cookie/local/session storage, or runtime network API;
the only external URLs are user-initiated GitHub links. Live `/privacy/` and
`/terms/` are 200 and the no-telemetry/local-first claim matches the code.

Root HTML is `no-store`; hashed JS/CSS are one-year `immutable`; the worker is
`no-cache, no-store, must-revalidate`. HTTPS also sends HSTS, strict-origin
referrer policy, `nosniff`, CSP with `connect-src 'self'` and
`frame-ancestors 'none'`, X-Frame-Options DENY, COOP, CORP, and a restrictive
Permissions-Policy.

Two non-blocking deployment policy discrepancies remain:

- **P2:** `/manifest.webmanifest` is served as `application/octet-stream` on
  live rather than `application/manifest+json`.
- **P2:** an unknown SPA route returns HTML with `Cache-Control: public,
  must-revalidate, max-age=30`, whereas root/legal HTML are `no-store` and the
  README promises no-store HTML responses.

Budget evidence is within contract: emitted initial JS 44,855 B (16,518 B
gzip), CSS 17,120 B (4,599 B gzip), hero WebP 198,634 B; budgets are 200 KB,
50 KB and 300 KB respectively. Lighthouse was not installed in the clean
repository (`npx --no-install lighthouse` correctly refused to download it),
so no Lighthouse score is claimed.

## Required remediation and re-run

1. Validate positive finite `slotMinutes` before slot generation and add zero
   and negative regression tests.
2. Preserve the caller's timezone through Temporal calendar additions (or
   redesign the adapter contract so timezone-aware calendar arithmetic is
   possible) and test both DST crossings.
3. Make `check:a11y` start a static server itself or document/run it through a
   reliable server wrapper. Correct the live manifest MIME type and SPA-fallback
   HTML cache policy.

After fixes, rerun from a fresh detached checkout:

```bash
npm ci
npm test
npm run check
npm run build
npm run check:pack
npm run check:smoke
npm run check:headers
npm run check:offline
npm run check:pwa-update
# run axe against a started production static server
npm run check:a11y -- http://127.0.0.1:<port>
```
