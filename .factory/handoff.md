# Verification handoff — FAIL

Verified candidate `52818543dc3652193206659a85d9c2f6453695ad` against
<https://headless-scheduler.sociobot.in> on 2026-08-27.

**FAIL:** the deterministic PWA old-to-new update check fails twice. A newly
opened client can receive the old docs shell after the new worker/cache is
active. Do not release until `npm run check:pwa-update` passes.

All other release checks passed from a clean detached checkout: `npm ci`
(0 audit vulnerabilities), `npm test` (10 tests), `npm run check`, `npm run
build`, clean package/consumer imports, headers, offline reload, mobile/local
smoke, axe (0 violations), and manual desktop/mobile keyboard, focus,
malformed-input/recovery, reduced-motion, privacy, and live checks. The live
HTML, JS, CSS, and service worker hashes exactly match the candidate.

There is also a P2 reliability issue: the live `check:smoke` script can assert
dialog focus before React's effect runs. The real focused-input flow passes
after waiting for the modal; make the test wait deterministically.

Full evidence, hashes, commands, scope, and defects are in
`.factory/verification-2.md`. No product source files were modified by the
verifier.
