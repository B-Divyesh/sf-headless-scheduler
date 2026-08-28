# Independent verification 7 — PASS

Date: 2026-08-28

Candidate: `79139908bffc4d12d8531fae61e8531c60115842`

Live URL: <https://headless-scheduler.sociobot.in>

## Verdict

**PASS — release candidate is verified.** Fresh evidence shows that the live static site is the candidate's production output and that the npm package works from a clean consumer. No release-blocking or other product defects were found.

The candidate includes the prior keyboard-resize repair: its separate resize control is keyboard reachable, 44 x 48 CSS px on a 390 px viewport, announces the exact changed end time, and retains the pointer-resize behavior.

## Clean checkout and package verification

The worktree was clean and at the candidate SHA before installation. Environment: Node `v22.23.2`, npm `10.9.8`.

| Check | Result | Fresh evidence |
| --- | --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS | 147 packages installed from the lockfile. |
| `npm test` | PASS | Vitest: 2 files, 28/28 tests passed. |
| `npm run check` | PASS | Both library and documentation TypeScript projects passed. No lint script exists in `package.json`. |
| `npm run build` | PASS | Exact library and static production builds completed to `dist/package` and `dist/site`. |
| `npm run check:pack` | PASS | A fresh temporary consumer installed the tarball and exercised ESM, CJS, optional React, declared types/exports, timezone behavior, and pointer validation. |
| `npm pack --dry-run` | PASS | 24 files; 40.0 kB packed / 139.4 kB unpacked. All 7 declared ESM, CJS, React, declaration, and CSS targets are included. |
| `npm run check:smoke` | PASS | 390 x 844 and 1440 x 900: add, keyboard move, keyboard resize, pointer resize, month navigation, no page overflow, zero console errors. |
| `npm run check:a11y` | PASS | Local production axe WCAG 2 A/AA + 2.1 AA: zero violations. |
| `npm run check:headers` | PASS | All 10 local cache/security response assertions passed. |
| `npm run check:offline` | PASS | Service-worker-controlled shell reloads offline. |
| `npm run check:pwa-update` | PASS | Old-to-new worker/cache handoff succeeded, with the new offline shell and new versioned cache. |

The library tests cover duplicate IDs, invalid visible ranges and slot values, create/update/move/resize/remove, overlap layout, continuous month windows, DST in `America/New_York`, non-DST calendar boundaries, snapped pointer create/move/resize, and invalid interaction settings. This is appropriate coverage for the documented public API; the clean-consumer check independently confirms package consumption rather than source imports.

## Live product exercise

Fresh external checks all passed:

```text
npm run check:smoke -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in /tmp/axe-live-verify-7.json
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:offline -- https://headless-scheduler.sociobot.in
```

The live smoke test passed at both desktop and 390 px mobile with zero browser errors. Live axe returned no violations, hence zero serious or critical findings.

Additional independent live-browser exercise verified:

- A blank title is rejected with the bound alert `Add a title so people know what is scheduled.` Filling `Boundary 23:59` after that error succeeds and announces `Boundary 23:59 added.`
- Delete announces `Morning briefing removed. Undo is available.` Undo restores it and announces `Morning briefing restored.`
- The first Tab reaches the visible `Skip to main content` link (3 px focus outline); Enter reaches `#main`. An event moves by 15 minutes with ArrowRight. Tab reaches its dedicated resize button; ArrowRight announces `Morning briefing resized to 10:30 AM.`
- The continuous month grid responds to Arrow navigation. The timeline intentionally remains horizontally scrollable on mobile instead of shrinking its time cells. No document-level horizontal overflow was found.
- With `prefers-reduced-motion: reduce`, computed document scrolling is `auto` and transition/animation durations are `0.00001s`.
- The document has `lang="en"`, a descriptive title, exactly one `h1`, one `main`, semantic controls, labels, error alert, live status, and the documented riso visual system. The local hero is original provenance-documented in `.factory/design.md`.

## Deployment identity, privacy, policy, and budgets

Fresh SHA-256 comparison of a newly built candidate against the live host matched exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `3ddc191bdf0b06e48c0fdbedae801bd7eacc5213ebeb5e04c07af59eaee7cac9` |
| `assets/index-CMCPOt7n.js` | `dcbac014cf9e5f6846e6b12d18a54fda36f11e2d8e44065f9cfc44af15a2b4db` |
| `assets/index-ZH1TuV6H.css` | `69e9f402f9cbdd3022683b1571690ef4f783f0d19a61b07d129f06eebdde667f` |
| `sw.js` | `afb15e4821b0a0a2d293499985e6c499bcec0b7083704e9a92fc7926931f06c6` |
| `manifest.webmanifest` | `29cb3e92c00d82a7d836f560587e00635f4e113f6c65844c692a1a96c7235ac0` |

First-load browser request observation recorded only the same origin and GET methods. There were no cookies, local storage, session storage, or IndexedDB databases. The only persisted client state was the expected versioned Cache Storage shell, `headless-scheduler-docs-8869f359d874a5e8`. `/privacy/` and `/terms/` return 200 and accurately describe the in-memory demo, telemetry-free package, and absence of accounts/payment.

The live host returns HSTS; self-only CSP including `connect-src 'self'` and `frame-ancestors 'none'`; `X-Frame-Options: DENY`; `nosniff`; strict referrer, permissions, COOP, and CORP policies. HTML and deep links are `no-store`; the hashed JavaScript is one-year immutable; and the worker is `no-cache, no-store, must-revalidate`.

Measured production assets meet the stated budgets: entry JavaScript is 47,221 B raw / 17,145 B gzip (under 200 KB); CSS is 17,468 B raw / 4,665 B gzip (under 50 KB); original hero WebP is 198,634 B (under 300 KB). A fresh Lighthouse CLI attempt used the installed Playwright Chromium but the tab crashed in Lighthouse's full-page-screenshot phase (`TARGET_CRASHED`), as did the candidate's committed prior Lighthouse artifact. Its incomplete run reported LCP 2.332 s, CLS 0, total transfer 225,150 B, and accessibility 100, but it is not treated as a valid Lighthouse score. This is a verifier-environment/tool limitation, not a demonstrated product failure; the independent browser, axe, bundle, header, and offline checks above all completed successfully.

## Defects

None found. Severity list: none.

## Reproduce

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm run check
npm run build
npm run check:pack
npm pack --dry-run
npm run check:smoke
npm run check:a11y
npm run check:headers
npm run check:offline
npm run check:pwa-update
npm run check:smoke -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in /tmp/axe-live-verify-7.json
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:offline -- https://headless-scheduler.sociobot.in
```
