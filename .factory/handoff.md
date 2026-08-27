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

The production container is built and served with:

```bash
docker build -t headless-scheduler .
docker run --rm -p 8080:8080 headless-scheduler
```

It builds the existing project in a Node 22 Alpine stage and copies only `dist/site` into an unprivileged Nginx runtime on port 8080.

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

## Deployment repair (2026-08-27)

- The prior accepted build was retained. The Azure Static Web Apps Free-SKU error 51021 was a subscription site-quota failure, not a product or build failure.
- Added a minimal multi-stage `Dockerfile`, `.dockerignore`, and Nginx configuration for the factory `container` deployment path. The runtime uses `nginxinc/nginx-unprivileged`, explicitly runs as `nginx`, and exposes only port 8080.
- Nginx serves `dist/site` with client-side route fallback; returns `no-store` for HTML; applies `public, max-age=31536000, immutable` to Vite’s `/assets/` files; returns `no-cache, no-store, must-revalidate` for `sw.js`; preserves the shipped PWA service worker; and adds CSP, HSTS, frame, MIME, referrer, permissions, COOP, and CORP protections.
- The a11y harness now bypasses CSP only inside its isolated Playwright context so axe can be injected without relaxing the deployed site’s CSP.
- A local Docker-compatible runtime was not installed in the worker, so direct `docker run` was unavailable. The factory ACR build completed successfully for `sf-headless-scheduler:56fb8ca4a139`, and its Container App revision reached `Healthy`/`Running` before the public-domain checks.
- Deployed through the factory Container Apps path to `https://headless-scheduler.sociobot.in`. Azure required the hostname to be registered in a disabled state before its managed certificate could be issued; the hostname is now SNI-bound with a successfully issued certificate.
- Public HTTPS verification: HTTP 200; valid custom-domain TLS; expected CSP/HSTS/security headers; no-store document and legal-page headers; immutable hashed JavaScript asset header; PWA service-worker no-store header; and a deep client route returned the SPA document with HTTP 200.
- Public browser verification: factory URL verifier found no page or console errors, one `h1`, `lang`, `main`, image alt text, and labelled controls; axe reported zero violations; mobile (`390 × 844`) and desktop (`1440 × 1000`) interaction smoke tests passed add-event, keyboard move, month navigation, timeline switching, and zero console errors. Evidence is under `.factory/evidence/deployed/`.

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
