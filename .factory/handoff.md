# Perfection loop round 1 handoff — PASS

Date: 2026-08-28
Work order: `headless-scheduler-polish-1`
Review base: `31d62e1fe21ca9c8a7dbe63f94589fad29cf8629`
Repair implementation: `9805c3a`
Live URL: <https://headless-scheduler.sociobot.in>

## What changed

- Replaced the metaphorical hero with a job-first headline, named audience, one primary sample action, adjacent outcome, and three tested facts.
- Added direct `/demo` and `?demo=1` entry points. The editable JSON playground opens with five events across four resources.
- Added the persistent demo banner, reset control, exit path, in-memory isolation, reload reset, exit reset, and `.factory/demo.md`.
- The production playground imports `headless-scheduler` from `dist/package`, not repository source.
- Replaced the false npm-registry command with a working release tarball at `/headless-scheduler-0.1.0.tgz`.
- Added ten claims and ten uniquely tagged Playwright tests in `.factory/claims.json` and `tests/claims.spec.ts`.
- Added Home, Demo, Privacy, Terms, and designed 404 states with route titles, descriptions, canonicals, Open Graph, Twitter cards, social art, and an Apple touch icon.
- Added History API navigation, Back/Forward restoration, H1 focus, a polite route announcement, consistent header/footer, skip link, legal links, build ID, and HTTP 404 handling.
- Added the required three-step section and plain scope/privacy section.
- Fixed mobile hit targets and overflow. The mobile demo shows live schedule output before the editor.
- Preserved the risograph inkboard identity and recorded derivative-asset provenance in `.factory/design.md`.
- Rewrote the README and added `.factory/copy-audit.md` plus the 103-character verb-first catalog description.

## Verification evidence

The exact implementation commit was cloned with `git clone --no-local` into `/tmp/headless-scheduler-clean-3S4ZZe`. A fresh `npm ci --ignore-scripts` completed before these checks:

- `npm audit --omit=dev` — zero vulnerabilities.
- `npm test` — 28/28 unit and integration tests passed.
- `npm run check` — library and site TypeScript checks passed.
- `npm run test:claims` — 10/10 claims passed in Chromium 1.58.2.
- `npm run check:pack` — clean ESM, CommonJS, React, type, CSS, timezone, and validation consumer checks passed.
- `npm run build` — produced `dist/package` and `dist/site`; initial site JS is 19.05 kB gzip and CSS is 5.62 kB gzip.
- `npm run check:smoke` — 390 × 844 and 1440 × 900 passed add, move, resize, month navigation, announcements, overflow, and console checks.
- `npm run check:a11y` — zero axe violations on Home, Demo, Privacy, Terms, and the 404 page.
- `npm run check:headers` — ten cache/security header checks passed; `/demo` returned 200 and an unknown route returned 404.
- `npm run check:offline` — service-worker-controlled offline reload passed.
- `npm run check:pwa-update` — old-to-new cache replacement and offline new-shell regression passed.
- `npm pack --dry-run` — 24 files, 39.5 kB packed, 138.0 kB unpacked.

Additional evidence:

- `.factory/evidence/claims.json` — Playwright claim report.
- `.factory/evidence/axe.json` — five-route accessibility report.
- `.factory/evidence/repair-1-verify/verify.json` — title, language, one H1, main, alt, label, and zero-console-error check.
- `.factory/evidence/home-mobile.png`, `home-desktop.png`, `demo-mobile.png`, and `demo-desktop.png` — first-screen evidence.
- `.factory/evidence/lighthouse-repair-1.json` — mobile Lighthouse: performance 98, accessibility 100, best practices 100, SEO 100; FCP 1.28 s, LCP 2.41 s, CLS 0, TBT 19 ms.

## Run locally

```bash
npm ci
npm test
npm run check
npm run test:claims
npm run check:pack
npm run check:smoke
npm run check:a11y
npm run check:offline
npm run check:pwa-update
npm run check:headers
```

Use `npm run build` for both artifacts. Deploy `dist/site` as the static site. Do not publish from this repository worker.

## Known gaps and next steps

No blocking review finding remains. The npm registry name is still unpublished because registry credentials belong to the factory. The released site states this plainly and serves a tested installable v0.1.0 tarball. Registry publication can replace that URL later without changing the package API.
