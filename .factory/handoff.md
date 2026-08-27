# Headless Scheduler v0.1.0 — repair handoff

## What changed

- `prepack` now runs `build:lib`. A direct clean `npm pack` or `npm publish` therefore contains every declared core/React ESM, CJS, declaration, and CSS target.
- Added `npm run check:pack`, which removes `dist/package`, packs through the lifecycle hook, installs that tarball in a fresh temporary consumer, and imports core and React entries with both ESM and CommonJS. GitHub Actions runs this clean tarball regression after tests, type checks, and a build.
- Documentation builds now emit a manifest and a generated `dist/site/sw.js`. Its cache version is a content hash of the emitted shell; it precaches the current HTML, hashed Vite JS/CSS, legal pages, offline page, imagery, icons, and manifest. Cache refresh requests are revision-qualified so an old worker cannot satisfy a new worker’s install from stale shell entries.
- The worker claims clients, removes old revision caches, uses cache-first shell assets, network-first `/api/` requests, and serves the cached shell/offline fallback for navigation. The site exposes an accessible update/reload notice when an established client sees an update.
- Added `dist/site/staticwebapp.config.json` through `site/public/`: immutable caching for `/assets/*`, no-store/no-cache service-worker policy, no-store HTML, SPA fallback exclusions, CSP, frame protection, permissions policy, COOP, CORP, referrer, and MIME protections.
- Kept the scheduler API and interactive documentation demo intact. Added original hand-authored PWA icon SVGs; their grid-and-ticket motif follows the existing Inkboard visual system.

## Run and verify

```bash
npm ci
npm test
npm run check
npm run build
npm run check:pack
npm run check:headers
npm run check:offline
npm run check:pwa-update
```

Browser checks against a built local preview:

```bash
npm exec -- vite preview --config site/vite.config.ts --host 127.0.0.1 --port 4173
npm run check:a11y -- http://127.0.0.1:4173 .factory/evidence/axe-repair.json
npm run check:smoke -- http://127.0.0.1:4173
```

After deployment, validate the live Static Web Apps response policy with:

```bash
npm run check:headers -- https://headless-scheduler.sociobot.in
```

Registry publication is intentionally not performed here. The factory can publish with `npm publish`; `prepack` will create the library artifacts automatically.

## Verification completed

- `npm test`: 10 tests passed.
- `npm run check`: library and documentation TypeScript checks passed.
- `npm run build`: ESM/CJS/declarations/preset and `dist/site` completed; generated worker precached 12 current shell entries.
- `npm run check:pack`: passed from a deleted `dist/package`; fresh consumer imported ESM, CommonJS, and React entries and checked all seven declared output targets.
- `npm run check:headers`: passed against a local server applying `dist/site/staticwebapp.config.json` (8 cache/security checks).
- `npm run check:offline`: passed with Playwright `context.setOffline(true)` and a cached-shell reload.
- `npm run check:pwa-update`: passed an old-build-to-new-build replacement; the active cache revision changed and the old cache was removed.
- Local Playwright axe check: zero WCAG 2 A/AA and 2.1 AA violations. Mobile smoke passed add-event, keyboard move, month navigation, timeline switching, no horizontal overflow, and no console errors.

## Deployment note

The public domain still serves the prior commit at handoff time. The requested live header command was run and correctly failed on its old `Cache-Control` policy (`Missing Cache-Control: no-store`). This is a deployment-state difference, not a remaining source/build defect: the generated `dist/site/staticwebapp.config.json` has been checked locally and must be included in the next factory static deployment. Re-run the live command above once that artifact is deployed.

## Known v1 boundaries

- Recurrence expansion, iCal parsing, printing, hosted builder, and Vue/Svelte adapters remain outside v0.1.
- The demo intentionally keeps edits in memory; library consumers own persistence and no user data is stored by the documentation site.
- The native date adapter is UTC-oriented; use the Temporal adapter for named-zone/DST calendar boundaries.
