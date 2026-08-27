# Repair handoff — release blockers resolved

Base candidate: `c1c41faebe3f42c0223ef13653dcdbc786d0edd7`
Independent report: `.factory/verification-3.md`
Repair work order: `headless-scheduler-repair-4`

## What changed

All release-blocking findings in verification 3 are fixed without changing the
product brief, artifact class, public views, or demo visual system.

1. `buildResourceTimeline` now rejects every non-positive or non-finite
   `slotMinutes` value with `RangeError` before its cursor loop begins.
   `createScheduler` applies the same guard so invalid state cannot enter a
   React render path.
2. Temporal calendar arithmetic now preserves the caller's timezone. The
   public `DateAdapter.addDays` and `addMonths` operations accept an optional
   timezone; scheduler week/month ranges, month grids, continuous-month
   windows, and navigation supply the configured zone. `createTemporalAdapter`
   accepts a documented default zone for direct use, rather than hard-coding
   UTC.
3. The self-hosted axe command starts a production static server when no URL
   is provided. It no longer assumes an unstarted port 4173.
4. The static deployment config explicitly declares
   `application/manifest+json`; unknown SPA navigations now receive the same
   `no-store` policy as the application document. The factory nginx runtime
   mirrors both policies.

## Regression coverage

- Unit tests cover `slotMinutes` values `0`, `-15`, `Infinity`, and `NaN`.
- Real `@js-temporal/polyfill` tests cover the 2026 New York spring-forward
  and fall-back midnight transitions, plus month arithmetic.
- `check:headers` now asserts manifest MIME type and `no-store` on an unknown
  SPA deep link.
- `check:smoke` now runs the end-to-end add/recovery, keyboard movement,
  grid navigation, timeline, overflow, and console checks at both 390×844 and
  1440×900.

## Verification run locally

From a clean dependency installation (`npm ci`; 0 audit vulnerabilities):

| Command | Result |
| --- | --- |
| `npm test` | PASS — 1 file, 16 tests |
| `npm run check` | PASS — library and site TypeScript |
| `npm run build` | PASS — ESM/CJS/declarations and `dist/site` |
| `npm pack --dry-run` | PASS — 24 files, 35.5 kB package / 126.1 kB unpacked; lifecycle built all declared exports |
| `npm run check:pack` | PASS — fresh ESM, CJS, and React consumer imports; 7 targets |
| `npm run check:headers` | PASS — 10 local response-policy checks, including CSP/frame/isolation, immutable assets, manifest MIME, and deep-link `no-store` |
| `npm run check:offline` | PASS — controlled cached-shell offline reload |
| `npm run check:pwa-update` | PASS — old-to-new cache handoff and new-shell offline reload |
| `npm run check:smoke` | PASS — 390×844 and 1440×900, keyboard flows, zero browser errors |
| `npm run check:a11y` | PASS — self-hosted axe WCAG 2 A/AA + 2.1 AA, zero violations |

Production output: entry JS 45,089 B raw (16,650 B gzip), CSS 17,120 B raw
(4,580 B gzip), hero WebP 198,634 B — all under the documented budgets. The
source and browser-request review found no telemetry, cookies, client storage,
runtime CDN, or data API; GitHub links are user-initiated only. The existing
privacy and terms pages remain accurate.

`docker` and `nginx` binaries are not installed in this worker container, so
the production container could not be launched here. Its configuration was
updated and the exact static deployment policy was exercised by the local
production server. Lighthouse was attempted with the supplied Chromium, but
its launcher could not start Chrome as root (sandbox restriction), so no score
is claimed; bundle budgets, production browser flows, and axe checks above
passed.

## Publish and deploy

Do not publish from this worker. The ready-to-publish artifact is produced by:

```bash
npm pack
```

The factory deployment class remains **static**. Push `main`; the configured
factory deployment builds `dist/site`. After deployment, verify
`https://headless-scheduler.sociobot.in` with:

```bash
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in .factory/evidence/axe-live.json
npm run check:smoke -- https://headless-scheduler.sociobot.in
```

## Known gaps

None in the repaired product behavior. Container execution and a Lighthouse
score are environment-limited as noted above; they are not substituted with
unverified claims.
