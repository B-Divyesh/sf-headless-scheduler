# Verification handoff 6 — FAIL

Verified candidate: `492bdab128f8fe4879b3227d520365d02a58d82b`

Verified URL: <https://headless-scheduler.sociobot.in>

Date: 2026-08-28

## Release result

**FAIL — do not release unchanged.** The requested candidate is live and byte-identical to the fresh production build. The previous incorrect resize announcement is repaired, but keyboard-only users cannot resize an event: the only resize handle is hidden from accessibility and unfocusable, with no keyboard duration command or alternate control. This is a P2 release blocker for the core scheduler interaction.

## What was verified

- Clean `npm ci --ignore-scripts --no-audit --no-fund` installed 147 packages.
- `npm test` passed 28/28 tests; `npm run check` passed; `npm run build` passed.
- `npm run check:pack` passed with a clean ESM/CJS/React package consumer. `npm pack --dry-run` produced a valid 24-file, 40.0 kB tarball.
- Local production smoke, axe, headers, offline reload, and service-worker update tests passed.
- The same smoke, axe, headers, and offline reload tests passed against the live hostname at both 390 px mobile and desktop. Axe found zero WCAG 2 A/AA + 2.1 AA violations and browser errors were zero.
- Live manual coverage passed for empty-title validation and recovery, a `23:59` event boundary, add, move, pointer resize, delete/Undo, month navigation, skip link, focus styling, reduced motion, responsive layout, and same-origin/no-user-data-storage privacy checks.
- Live bytes match the fresh candidate build: `index.html` `29520add…5988`, JS `678ef264…3f41`, CSS `831db0b0…9439`, `sw.js` `4edee4bc…6fba`, and manifest `29cb3e92…5ac0`.

## Required fix

At `site/src/main.tsx:179`, the resize target is `<i class="resize-handle" aria-hidden="true">`; browser inspection confirms `tabIndex=-1`. The only event key handler (`site/src/main.tsx:162-168`) moves with left/right arrows and deletes—it cannot resize. Provide a focusable keyboard resize interaction and accurate live feedback, then add a browser regression test and re-run the commands in [verification-6.md](verification-6.md).

## Operational notes

The static output is deploy-ready and keeps the documented privacy/security policy: no analytics, tracking, cookies, local/session storage, IndexedDB, runtime CDN, or third-party initial requests; only the versioned PWA Cache Storage entry is created. HTML is `no-store`, hashed assets immutable, and the service worker no-cache. JS (46,460 B raw / 16,937 B gzip), CSS (17,120 B raw / 4,576 B gzip), and hero image (198,634 B) meet their budgets.

Docker is not installed in this verifier container, so the container image itself was not built. The exact repository production build and deployed static artifact were both tested. Do not publish the npm package until the P2 is repaired and verification passes.
