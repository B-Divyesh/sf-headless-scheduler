# Headless Scheduler v0.1.0 — handoff

## What shipped

- Publish-ready `headless-scheduler` npm package in TypeScript, version 0.1.0, with ESM, CJS, and declaration output.
- Dependency-free core with immutable observable state, event create/update/move/resize/remove, day/week/month navigation, collision layout, resource-timeline geometry, and continuous-month virtualization.
- Pointer Events helper for create/move/resize with pointer capture and snapping; ARIA-grid keyboard navigation helper and live-announcement state.
- Native, Temporal, and caller-injected date-fns adapters. Consumers needing named-zone/DST calendar boundaries should use the Temporal adapter with native Temporal or `@js-temporal/polyfill`.
- Optional React 18/19 adapter with hook and render-prop component. React remains a peer dependency, not a core dependency.
- Copyable Tailwind-native `preset.css` built from stable `hs-*` hooks and CSS variables.
- Responsive documentation site with a real scheduler instance: timeline drag/resize, keyboard moves, event creation dialog, reversible removal, day/week/month/timeline switching, month-grid arrow navigation, empty/error/offline states, and legal pages.
- Original risograph hero artwork at `site/public/riso-scheduler.webp` (198,634 bytes). It was generated using the factory-image deployment from the prompt in `riso-scheduler.webp.json`; the 3.2 MB PNG intermediate was removed after WebP optimization.
- Versioned service-worker shell cache, immutable asset headers, no analytics, cookies, storage, external fonts/scripts, or runtime network services.

## Run and verify

```bash
npm install
npm test
npm run check
npm run build
npm run dev
```

The required build command is `npm run build`. Library artifacts land in `dist/package`; static deployment output lands in `dist/site`, with `dist/site/index.html` at its root. Registry publication is intentionally not performed by the worker. Validate the package with `npm pack --dry-run`.

Browser checks (with a site running at port 4173):

```bash
npx vite preview --config site/vite.config.ts --host 0.0.0.0
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 .factory/evidence
npm run check:a11y -- http://127.0.0.1:4173 .factory/evidence/axe.json
npm run check:smoke -- http://127.0.0.1:4173
```

## Verification results

- `npm test`: 10 tests passed.
- `npm run check`: both library and site TypeScript checks passed.
- `npm run build`: passed; ESM, CJS, `.d.ts`, preset CSS, and static site produced.
- `npm pack --dry-run`: passed; 24 package files, 29.8 KB packed / 121.3 KB unpacked.
- Factory URL verifier: HTTP 200; title and `lang` present; exactly one h1; main landmark present; zero missing image alt attributes; zero unlabeled buttons; zero console/page errors.
- axe-core 4.13 in Playwright at 390 × 844: zero WCAG 2 A/AA, WCAG 2.1 AA violations.
- Mobile interaction smoke: event dialog focus, add event, keyboard event move, month-grid arrows, view switching, 390 px overflow, and console all passed.
- Lighthouse 12.8.2 mobile: Performance **98**, Accessibility **100**, Best Practices **100**, SEO **100**. LCP **2.3 s**, TBT **90 ms**, CLS **0**. Report is `.factory/evidence/lighthouse.json`.
- Static budgets: initial JS **44,249 bytes**, CSS **16,723 bytes**, hero WebP **198,634 bytes**; all below the 200 KB / 50 KB / 300 KB limits. No webfont payload.
- Screenshots and machine-readable reports are under `.factory/evidence/`.

## Known v1 boundaries

- Recurrence expansion and iCal parsing are caller responsibilities; events are accepted pre-expanded.
- Vue and Svelte adapters, printing, and a hosted builder are not part of v0.1. The framework-neutral core is usable from those frameworks now.
- The native adapter is a small UTC-oriented fallback. Use `createTemporalAdapter` when named-zone/DST boundary correctness is required.
- The example keeps edits in memory by design. Persistence belongs to the consumer and no user data is stored by this site.
- The accessibility/smoke scripts use the factory container's Playwright installation path; the library build and unit tests have no such environment dependency.

## Suggested next steps

- Publish v0.1.0 through factory-owned npm credentials and add install testing against the packed tarball in CI.
- Add adapters for Vue/Svelte based on adoption demand.
- Add automated DST fixtures using `@js-temporal/polyfill` and large-data benchmarks for 10k+ events/resources.
