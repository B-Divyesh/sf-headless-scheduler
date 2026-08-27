# Independent verification 4 — FAIL

Date: 2026-08-27

Candidate: `5b120e6505579da4c3dd5e968180695ccc4c2dfa`
Live URL: <https://headless-scheduler.sociobot.in>

## Verdict

**FAIL — do not publish.** The candidate fixes the earlier clean-pack and PWA
update failures, and the live deployment is an exact candidate build. However,
the default public `nativeDateAdapter` silently ignores a configured non-UTC
timezone, returning wrong calendar boundaries across DST. This contradicts
the documented `timeZone` contract and the brief's timezone-correct calendar
requirement. Pointer snapping also accepts invalid values until a drag fails.
No product source was modified in this verification.

## Clean checkout and package checks

Repository HEAD was the requested SHA and clean before `npm ci`. Environment:
Node `v22.23.2`, npm `10.9.8`; 147 packages installed and `npm audit` found
zero vulnerabilities. There is no lint script in `package.json`.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | Vitest: 1 file, 16/16 tests. |
| `npm run check` | PASS | Library and site TypeScript projects. |
| `npm run build` | PASS | `dist/package`, declarations, CSS preset and `dist/site`; worker precache has 12 entries. |
| `npm run check:pack` | PASS | Removes library output, invokes `prepack`, installs tarball into a fresh consumer, and imports ESM, CJS and React exports (7 targets). |
| `npm pack --dry-run` | PASS | 24 files; 35.5 kB tarball / 126.1 kB unpacked; all declared entry points and types included. |
| `npm run check:headers` | PASS | 10 local production response-policy checks. |
| `npm run check:offline` | PASS | Service-worker-controlled offline shell reload. |
| `npm run check:pwa-update` | PASS | Deterministic old-to-new cache handoff and new-shell reload. |
| `npm run check:smoke` | PASS | Add-event, keyboard movement, month navigation, Timeline at 390×844 and 1440×900; zero browser errors. |
| `npm run check:a11y` | PASS | Self-hosted production axe WCAG 2 A/AA + 2.1 AA: zero violations. |

The built static entry JS is 45,089 B raw / 16,650 B gzip, CSS 17,120 B raw /
4,580 B gzip, and the hero WebP is 198,634 B: all below the 200 KB JS, 50 KB
CSS, and 300 KB image budgets. Lighthouse CLI was attempted with Playwright's
Chromium and `--no-sandbox`, but its tab crashed in this container, so no
Lighthouse score is claimed; this does not alter the measured bundle or browser
results above.

## Independent API boundary exercise

The packed public API was additionally exercised with normal resource movement,
range validation, Temporal DST arithmetic, and malformed pointer settings.
The repaired `slotMinutes` cases (`0`, negative, `Infinity`, `NaN`) reject
up front and the Temporal adapter produces correct New York spring and fall
DST midnights.

### P1 — default adapter gives wrong non-UTC calendar boundaries

The README states that `timeZone` controls calendar boundaries and presents
`nativeDateAdapter` as the default. This built-package invocation instead
creates a UTC range:

```ts
const scheduler = createScheduler({
  dateAdapter: nativeDateAdapter,
  timeZone: 'America/New_York',
  initialView: 'day',
  anchorDate: '2026-03-08T16:00:00.000Z'
})
// actual visibleRange:
// { start: '2026-03-08T00:00:00.000Z', end: '2026-03-09T00:00:00.000Z' }
```

For the 2026 New York spring-forward date, the calendar day must be
`2026-03-08T05:00:00.000Z` through `2026-03-09T04:00:00.000Z` (23 hours).
Source inspection confirms that every calendar operation in
`nativeDateAdapter` uses UTC getters/setters and ignores the supplied timezone.
Day, week, month and continuous-month users selecting a non-UTC zone can
therefore receive dates shifted into the wrong local day. The Temporal adapter
does work when explicitly supplied, but that does not make the default's
accepted `timeZone` truthful.

Severity: **P1**, because a booking/staffing scheduler's default API silently
computes the wrong calendar data at a standard DST boundary. Fix by providing
timezone-aware default operations, using/requiring Temporal for non-UTC, or
rejecting non-UTC with an actionable error; add default-adapter DST day/week/
month regression coverage.

### P2 — invalid pointer snap configuration fails late

`createPointerInteraction` accepts `snapMinutes: 0`, `-15`, `NaN`, and
`Infinity`. On a subsequent pointer move, zero, NaN, and Infinity reach
`new Date(NaN).toISOString()` and throw `RangeError: Invalid time value`;
negative snapping is accepted. This is an invalid-input/recovery defect in a
public primitive, not an issue in the demo's valid 15-minute configuration.

Severity: **P2**. Reject non-positive or non-finite `snapMinutes` when the
interaction is created, and validate finite positive `pixelsPerMinute` too.

## Browser, accessibility and product exercise

The local production build and live site were exercised with Playwright at
390×844 and 1440×900.

- Normal flow: add an event, switch Day/Week/Month/Timeline, keyboard-move an
  event, delete and Undo; all passed.
- Invalid/recovery: blank title announces “Add a title so people know what is
  scheduled.”; a corrected title adds the event. The library rejects malformed
  ISO/range inputs and repaired invalid timeline slot widths.
- Pointer flow: real pointer drag moved Morning briefing from 08:30–10:00 to
  09:15–10:45; its resize handle then extended it to 11:30. No page or console
  errors occurred.
- Keyboard/focus: keyboard-only smoke reached the dialog title input, moved a
  focused event, navigated the month grid, and switched Timeline. At 390 px,
  focused Add event had a `rgb(36, 86, 166)` solid 3 px outline; its box was
  151.0×44.8 CSS px. No horizontal page overflow at either viewport.
- Reduced motion: `scroll-behavior` was `auto` and event transition duration
  was `0.00001s` with `prefers-reduced-motion: reduce`.
- Axe reported zero total WCAG 2 A/AA and 2.1 AA violations locally and live,
  hence zero serious/critical findings. The page has `lang=en`, title, one
  `<h1>`, one `<main>`, a skip link and semantic dialog/grid use.

## Live deployment identity, privacy and response policy

The deployed static files exactly match the local candidate build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `d25d4065802c89cc2ffb1b0fa3bdaa7a790163c18a0d0f8e7d8e2d1951a49ddd` |
| `assets/index-CAolVr1y.js` | `19618be673e2efe696e57beecdd05c68ee15377b1ded11f20c005663d7ce303d` |
| `assets/index-D1Xy_nRN.css` | `831db0b0822793d06751eeddfc37a2d8514940c879244d8ef0f17da0ed094039` |
| `manifest.webmanifest` | `29cb3e92c00d82a7d836f560587e00635f4e113f6c65844c692a1a96c7235ac0` |
| `sw.js` | `1fffe8b1ea1b2a91559dc31cd06acfb9f2218a1a56a03bab8768d3c4255fa836` |

Live `check:headers`, `check:smoke`, `check:a11y`, and `check:offline` all
passed. HTTPS sends HSTS, CSP including `connect-src 'self'` and
`frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, referrer,
permissions, COOP and CORP policies. HTML and deep links are `no-store`;
hashed assets are one-year immutable; `sw.js` is no-cache/no-store; manifest
has `application/manifest+json`.

Initial browser requests were same-origin only. The source/bundle review and
live browser check found no analytics, telemetry, cookies, local/session
storage, IndexedDB writes, runtime CDN, or data API. The only external URLs
are user-initiated GitHub links. `/privacy/` and `/terms/` are live and agree
with the in-memory demo and consumer-owned persistence claims.

## Required remediation and re-run

1. Resolve the default-adapter non-UTC contract, then test New York (and at
   least one non-DST zone) day/week/month/continuous-month boundaries through
   `createScheduler` using the default path.
2. Validate pointer `snapMinutes` and `pixelsPerMinute` before any pointer
   event; test zero, negative, NaN and Infinity.
3. From a clean checkout, rerun:

```bash
npm ci
npm test
npm run check
npm run build
npm run check:pack
npm pack --dry-run
npm run check:headers
npm run check:offline
npm run check:pwa-update
npm run check:smoke
npm run check:a11y
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:smoke -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in .factory/evidence/axe-live.json
npm run check:offline -- https://headless-scheduler.sociobot.in
```
