# Repair handoff 6

Base verifier report: `eb01ae479343642b9dd8a7766399bef5923877aa`
Repaired candidate: `14258c427bdfcc2278a34b13416e572191ce4aa5`
Artifact: npm library (ESM, CJS, declarations) with static documentation PWA

## Result

The verifier's only remaining release blocker is fixed. A successful timeline
resize now announces the changed **end** time, rather than the unchanged start
time. For example, resizing Morning briefing from 08:30–10:00 to 08:30–10:45
now announces `Morning briefing resized to 10:45 AM.` in the visible and
polite live status region.

The correction is in `site/src/main.tsx`, with formatting isolated in
`site/src/interaction-notice.ts`. It preserves the existing move announcement,
which correctly reports the changed start time.

## Regression coverage

- `tests/interaction-notice.test.ts` has exact expectations for resize-end
  (`10:45 AM`) and move (`8:45 AM`) completion text.
- `scripts/smoke.mjs` now performs a real pointer resize at **390×844** and
  **1440×900** and fails unless the live status reports the resulting end time.
  It also continues to cover add event, keyboard ArrowRight move, month-grid
  keyboard navigation, Timeline return, viewport overflow, and console errors.

## Clean verification evidence

All commands were run in this checkout after `npm ci` (147 packages; no
vulnerabilities):

| Command | Result |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS — clean lockfile install |
| `npm test` | PASS — 2 files, **28/28** tests |
| `npm run check` | PASS — strict library and site TypeScript checks |
| `npm run build` | PASS — ESM/CJS/declarations and `dist/site` |
| `npm run check:pack` | PASS — fresh tarball consumer exercised ESM, CJS, React, timezone and pointer validation |
| `npm pack --dry-run` | PASS — 24 files, 40.0 kB package / 139.4 kB unpacked |
| `npm run check:smoke` | PASS — desktop and 390 px, keyboard and resize announcement |
| `npm run check:a11y` | PASS — zero WCAG 2 A/AA + 2.1 AA violations |
| `npm run check:headers` | PASS — 10 production response/security checks |
| `npm run check:offline` | PASS — service-worker-controlled offline reload |
| `npm run check:pwa-update` | PASS — deterministic old-to-new cache and offline-shell handoff |
| `npm ci && npm test && npm run build:site` | PASS — exact static deployment build command |

The production site bundle built from the repaired candidate is 46,460 B raw /
16,954 B gzip JS, 17,120 B raw / 4,599 B gzip CSS, and has a 198,634 B hero
WebP. It remains within the stated budgets. Source and request review found no
analytics, telemetry, browser storage, cookies, runtime CDN, or third-party
requests; the library remains local-first and network-free.

Local build identities:

| File | SHA-256 |
| --- | --- |
| `index.html` | `29520add7850e1b149e109be00760d3aadf1b696965a775b654eeef42ace5988` |
| `assets/index-BJfMCuE9.js` | `678ef264ceeb35af23d09b952d1ee1904cbb68785e87f48109541f65bf403f41` |
| `assets/index-D1Xy_nRN.css` | `831db0b0822793d06751eeddfc37a2d8514940c879244d8ef0f17da0ed094039` |
| `sw.js` | `4edee4bca8773036aff97755d30173d479a179ce57867613fd671cccbc2a6fba` |
| `manifest.webmanifest` | `29cb3e92c00d82a7d836f560587e00635f4e113f6c65844c692a1a96c7235ac0` |

## Push and deployment handoff

`14258c4` was pushed to `origin/main`; GitHub Actions run
`33128347522` completed successfully. The work order's static deployment build
configuration (`npm ci && npm test && npm run build:site`, output
`dist/site`) was run successfully above.

At 2026-08-28 00:03 UTC, the public hostname still returned the previous
candidate's `index.html` SHA-256
`82b0403865d415d8e05a890bb30b04ce0bad3447de792b6a65feb665e55275fc`, and its
browser smoke consequently reproduced the old incorrect `8:45 AM` message.
No deployment target or credentials are present in the work order beyond the
static build/output configuration, and repository instructions reserve
infrastructure deployment for the factory. Deploy `dist/site` from `14258c4`
to `https://headless-scheduler.sociobot.in`, then run:

```bash
npm run check:smoke -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in .factory/evidence/axe-live.json
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:offline -- https://headless-scheduler.sociobot.in
```

The repaired live build should match the five local hashes above and the smoke
output must include `"resizeAnnouncement":true`.

## Ready to publish

Do not publish from this worker. The package is ready for the registry owner:

```bash
npm pack
npm publish
```
