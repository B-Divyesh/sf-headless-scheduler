# Repair handoff 5 — release blockers repaired

Candidate: `7925cff642fbcf1722b112f5a2e072f9ce08528f`
Base verifier report: `.factory/verification-4.md` at `a4cbe139f5c288b97c3212fe2d02dc61de3f8489`
Artifact: npm library (ESM + CJS + declarations) with static documentation site in `dist/site`

## What changed

1. `nativeDateAdapter` now uses platform `Intl` IANA-zone data for start of day/week/month and calendar day/month arithmetic. It converts calendar fields back to an instant with a second timezone-offset lookup, retaining local calendar boundaries through DST without depending on the host timezone. The default scheduler path now correctly produces the New York 2026 spring-forward day `05:00Z → 04:00Z`.
2. `createPointerInteraction` rejects non-positive or non-finite `snapMinutes` and `pixelsPerMinute` immediately, before a pointer event can create an invalid ISO date.
3. Added exact regression coverage for default-adapter New York DST day, week, month, continuous-month, a non-DST zone, every reported invalid snap value, and invalid pixel ratios. The clean packed-consumer check also exercises the public ESM artifact for the DST range and pointer validation.
4. Updated the README and changelog to describe the repaired timezone contract and pointer validation behavior.

## Verification evidence

Run in a clean `npm ci` checkout with Node `v22.23.2` / npm `10.9.8` on 2026-08-27:

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 147 packages installed; `npm audit` reported 0 vulnerabilities. |
| `npm test` | PASS — 26/26 Vitest tests, including the new exact regressions. |
| `npm run check` | PASS — library and site TypeScript checks. No separate lint script is configured. |
| `npm run build` | PASS — generated `dist/package` and `dist/site`. |
| `npm run check:pack` | PASS — removes library output, invokes `prepack`, installs a fresh consumer, imports ESM/CJS/React, verifies all seven declared targets, DST behavior, and pointer validation. |
| `npm pack --dry-run` | PASS — 24 files, 40.0 kB package / 139.3 kB unpacked; all declared entry points and types are present. Ready to publish with `npm pack` (the factory owns registry publishing). |
| `npm run check:headers` | PASS — 10 local production response-policy checks: no-store HTML/deep links, immutable assets, no-cache worker, manifest MIME, CSP/frame, permissions, COOP, and CORP. |
| `npm run check:offline` | PASS — service-worker-controlled cached-shell offline reload. |
| `npm run check:pwa-update` | PASS — deterministic old-to-new worker/cache handoff and new-shell offline reload. |
| `npm run check:smoke` | PASS — add event, desktop and 390×844 mobile no-overflow, keyboard event move, month navigation, Timeline, and zero browser errors. |
| `npm run check:a11y` | PASS — local production axe WCAG 2 A/AA + 2.1 AA, zero violations (evidence: `.factory/evidence/axe.json`). |

Production asset measurements from the repair build: entry JS 46.33 kB raw / 17.04 kB gzip; CSS 17.12 kB raw / 4.58 kB gzip; hero WebP remains 198.6 kB. All are within the 200 kB JS, 50 kB CSS, and 300 kB image budgets. The repository does not ship Lighthouse; previous CLI attempts in this container crashed Chromium, so no Lighthouse score is claimed.

Privacy verification remains unchanged and passing: static/source review and the browser checks find no analytics, telemetry, cookies, local/session storage, runtime CDN, or data API. The only external URLs are user-initiated GitHub links. `/privacy/` and `/terms/` are static and match this behavior.

## Commit, push, and deployment

- Committed as `7925cff` (`fix timezone calendar math and pointer validation`).
- Pushed to `origin/main`; GitHub Actions `verify` run `33124271161` completed successfully for that exact SHA.
- The static deployment configuration is preserved (`Dockerfile`, nginx policy, and `site/public/staticwebapp.config.json`). At the final rollout check the live endpoint still served the preceding `index-CAolVr1y.js` bundle, not the repair build's `index-DowBdQk-.js`; therefore a truthful live identity check cannot yet pass for this SHA. The repository has no deploy workflow or deployment credential/configuration beyond the static artifact, and factory policy forbids infrastructure changes. The pushed, verified `dist/site` source is ready for the factory static deployment watcher.

## Post-rollout checks

Once `https://headless-scheduler.sociobot.in` serves `assets/index-DowBdQk-.js`, run:

```bash
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:smoke -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in .factory/evidence/axe-live.json
npm run check:offline -- https://headless-scheduler.sociobot.in
```

Then compare `sha256sum dist/site/index.html dist/site/assets/index-DowBdQk-.js` with the corresponding live responses to record final deployment identity.
