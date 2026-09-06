# Verification 8 handoff — PASS

- Date: 2026-09-06
- Work order: `headless-scheduler-verify-8`
- Live URL: <https://headless-scheduler.sociobot.in>
- Implementation reviewed: `c4aa78ae557c349f5c9dff7f4fdad0980b4139b7`
- Documentation and evidence base: `b2a28a3ef14ab508bc02d9e0ec1e87cbb78ade5a`

## Result

**PASS.** Zero findings and zero untested claims.

Independent QA covered the live phone and desktop first screen, the package-backed sample demo, normal and recovery paths, keyboard and pointer input, accessibility, privacy, offline behavior, service-worker updates, response policy, route metadata, legal pages, designed 404, clean package consumption, and all public claims. No product code was changed.

The complete report is `.factory/verification-8.md`.

## Main evidence

- Fresh remote clone: `/tmp/headless-scheduler-verify8.Whsq3l`, initially clean at `b2a28a3`.
- All 33 literal claim commands passed separately. `npm run test:claims:each` also passed 33/33, and the full local and live browser suites each passed 34/34.
- `npm test`: 32/32.
- `npm run check`, `npm run build`, `npm run check:pack`, and `npm pack --dry-run`: passed.
- Local smoke, five-route axe, ten header checks, offline reload, and old-to-new PWA update: passed.
- Live smoke, five-route axe, ten header checks, offline reload, and factory URL verification: passed.
- Fresh phone and desktop browser audit passed one-click sample entry, realistic data, persistent demo label, blank-title and malformed-JSON recovery, 23:59 creation, keyboard move/resize, delete/undo, reset/reload, route focus/back, same-origin requests, and no saved user data.
- Fresh Lighthouse mobile: 98 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 2.130 s, CLS 0, TBT 68 ms.
- Entry JavaScript: 55,640 bytes raw / 19,597 bytes gzip. CSS: 22,583 bytes raw / 5,702 bytes gzip. Hero WebP: 198,634 bytes.
- Nine files from a clean build of implementation `c4aa78a` match live byte for byte. The later commits through `b2a28a3` contain only `.factory` reports and evidence.

Evidence is under `.factory/evidence/verification-8/`. The deliberate unknown-route HTTP 404 is expected and passed as a designed page.

## Earlier findings

All findings from Reviews 1, 2, and 4 and Verifications 1–6 were checked against fresh evidence and remain closed. Review 3 and Verification 7 had no unresolved findings. The full mapping is in `.factory/verification-8.md`.

## Remaining work

No product repair is required. npm publication remains operator-owned. Vue and Svelte adapters, recurrence expansion, iCal parsing, printing, and a hosted builder remain outside the documented v0.1 scope.
