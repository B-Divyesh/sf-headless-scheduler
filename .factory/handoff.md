# Repair handoff — keyboard timeline resize

Date: 2026-08-28

Base verified candidate: `492bdab128f8fe4879b3227d520365d02a58d82b`

## Repair

Resolved the P2 finding in `verification-6.md`: the timeline resize affordance is now a separate, focusable 44 × 48 px button rather than an `aria-hidden` decorative element nested in an event button. It has an explicit accessible name describing its current end time and its arrow-key behavior. `ArrowRight` extends the event by 15 minutes; `ArrowLeft` shortens it by 15 minutes without allowing a duration below 15 minutes. Each change updates the existing polite live region with the exact new end time.

The visible demo instructions now document the keyboard path. The original pointer resize interaction remains available on the same control. The semantic structure no longer nests one interactive control within another.

## Regression coverage

`scripts/smoke.mjs` now performs the exact browser regression at both 390 × 844 and 1440 × 900:

1. Focuses `Morning briefing`, presses Tab, and asserts the resize control is the focused, tabbable element.
2. Presses ArrowRight and asserts the exact polite announcement: `Morning briefing resized to 10:30 AM.`
3. Asserts that the resize control's accessible name reflects the new end time.
4. Continues to exercise the pointer resize path and its completion announcement.

## Verification evidence

All commands were run from a clean install on Node `v22.23.2`:

- `npm ci --ignore-scripts --no-audit --no-fund` — passed; installed 147 packages.
- `npm test` — passed, 28/28 tests.
- `npm run check` — passed (library and site TypeScript).
- `npm run build` — passed; produced `dist/package` and `dist/site`.
- `npm run check:pack` — passed; clean ESM, CJS, and optional React consumer exercised all 7 targets.
- `npm pack --dry-run` — passed; 24 files, 40.0 kB package / 139.4 kB unpacked.
- `npm run check:smoke` — passed at 390 × 844 and 1440 × 900, including add, keyboard move, keyboard resize, pointer resize, month navigation, no horizontal page overflow, and zero console errors.
- `npm run check:a11y` — passed; axe WCAG 2 A/AA + 2.1 AA returned zero violations. Fresh result: `.factory/evidence/axe.json`.
- `npm run check:headers` — passed all 10 local cache/security response checks.
- `npm run check:offline` — passed; the service-worker-controlled production shell reloads offline.
- `npm run check:pwa-update` — passed deterministic old-to-new worker/cache handoff.
- Production browser screenshots were inspected at both target viewports. The 390 px layout retains the intentionally horizontally scrollable timeline and the resize target stays visible and touch-sized.

Privacy and artifact class are unchanged: this remains a static documentation/demo site plus an npm library, with no analytics, cookies, storage, runtime CDN, or third-party initial requests. The only client persistence remains the versioned PWA Cache Storage shell.

## Release and deployment

This repair is ready to publish but was not published to npm (the factory owns registry credentials). The package can be created with `npm pack` after the normal `npm run build:lib` prepack hook.

The static deployment is triggered from the committed `main` branch by the factory deployment configuration. After that deployment completes, rerun the four external-url checks from `verification-6.md` against `https://headless-scheduler.sociobot.in` to record live artifact identity and policy evidence.
