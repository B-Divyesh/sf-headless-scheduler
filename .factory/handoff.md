# Verification handoff 4 — FAIL

Candidate: `5b120e6505579da4c3dd5e968180695ccc4c2dfa`

Live URL: <https://headless-scheduler.sociobot.in>
Independent report: `.factory/verification-4.md`

## Verdict

**FAIL — do not publish this npm library.** The repaired package, PWA, docs
site, live deployment, and accessibility checks all pass, but the default
public date adapter silently ignores a supplied non-UTC `timeZone`. This
returns wrong calendar boundaries (including DST days) despite the README
claim that `timeZone` controls calendar boundaries. That is a core scheduling
correctness failure. A second invalid-input defect leaves pointer snapping
misconfigured until it throws during a drag.

## Release-blocking defect

1. **P1 — `nativeDateAdapter` ignores `timeZone`.** In the built package:

   ```ts
   createScheduler({
     dateAdapter: nativeDateAdapter,
     timeZone: 'America/New_York',
     initialView: 'day',
     anchorDate: '2026-03-08T16:00:00.000Z'
   }).getState().visibleRange
   // actual:   2026-03-08T00:00:00.000Z → 2026-03-09T00:00:00.000Z
   // expected: 2026-03-08T05:00:00.000Z → 2026-03-09T04:00:00.000Z
   ```

   The actual range is UTC midnight-to-midnight; the expected New York range
   is the 23-hour spring-forward calendar day. `nativeDateAdapter.startOfDay`,
   `startOfWeek`, `startOfMonth`, `addDays`, and `addMonths` ignore their
   timezone parameters. The Temporal adapter passes this case, but it is not
   the default and the API silently reports the wrong day to ordinary default
   users. Implement timezone-aware native operations, require/route through
   Temporal for non-UTC zones, or reject non-UTC use explicitly; add public
   regression tests for default-adapter DST day/week/month ranges.

2. **P2 — pointer snapping accepts invalid configuration.**
   `createPointerInteraction` accepts `snapMinutes: 0`, `NaN`, `Infinity`,
   and negative values. Zero/NaN/Infinity then throw `RangeError: Invalid time
   value` only when a pointer moves; a negative value produces an accepted
   backwards snap. Validate a positive finite `snapMinutes` at construction
   (and validate finite `pixelsPerMinute`) so consumer recovery is immediate
   and deterministic.

## Evidence retained in the report

From a clean `npm ci` under Node `v22.23.2` / npm `10.9.8`, all available
repository gates passed: 16 unit tests, TypeScript check, production build,
clean pack plus ESM/CJS/React consumer installation, header policy, offline
reload, two-version service-worker update, desktop/mobile browser smoke, and
axe. The live URL is byte-identical to the locally built candidate for HTML,
JS, CSS, manifest, and worker. It has no live deployment-only regression.

No product source was changed by verification. The next worker should fix the
two public API defects, then run the commands listed in
`.factory/verification-4.md` from a clean checkout before publishing.
