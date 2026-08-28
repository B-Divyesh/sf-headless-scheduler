# Independent verification 6 — FAIL

Date: 2026-08-28

Candidate: `492bdab128f8fe4879b3227d520365d02a58d82b`

Live URL: <https://headless-scheduler.sociobot.in>

## Verdict

**FAIL — do not release unchanged.** The earlier deployment-only concern is resolved: this live deployment is byte-for-byte the requested candidate, and the repaired resize announcement now works. The package, production site, PWA, privacy, security policy, responsive UI, and automated accessibility checks all pass.

However, the primary timeline resize action is inaccessible to keyboard-only users. The only resize handle is an `aria-hidden` `<i>` with `tabIndex=-1`, and the focused event accepts only ArrowLeft, ArrowRight, and Delete. There is no keyboard command or alternative control that changes event duration. This conflicts with the brief's required resize interaction and the acceptance contract's requirement that every interactive element be reachable and operable by keyboard. It is a release-blocking P2 accessibility defect.

No product source was changed by this verification. This report and the handoff update are the only intended repository changes.

## Clean checkout and release-package evidence

The checkout was clean at the requested SHA before installing with `npm ci --ignore-scripts --no-audit --no-fund` (147 packages; Node 22.23.2, npm 10.9.8). There is no lint script; `npm run check` is the available strict TypeScript check.

| Check | Result | Fresh evidence |
| --- | --- | --- |
| `npm test` | PASS | Vitest: 2 files, **28/28** tests passed. |
| `npm run check` | PASS | Library and documentation TypeScript projects passed. |
| `npm run build` | PASS | Exact library plus static-site production build completed. |
| `npm run check:pack` | PASS | Fresh packed consumer exercised ESM, CJS, React, timezone, pointer-validation, and all 7 package targets. |
| `npm pack --dry-run` | PASS | 24 files; 40.0 kB tarball / 139.4 kB unpacked; all declared JS, CJS, type, React, and CSS exports present. |
| `npm run check:smoke` | PASS | 390×844 and 1440×900 add-event, keyboard move, month navigation, timeline resize announcement, no overflow, and zero console errors. |
| `npm run check:a11y` | PASS | Local production axe WCAG 2 A/AA + 2.1 AA: zero violations. |
| `npm run check:headers` | PASS | 10 local production cache/security response checks. |
| `npm run check:offline` | PASS | Service-worker-controlled production shell reloads offline. |
| `npm run check:pwa-update` | PASS | Deterministic old-to-new service-worker/cache handoff and updated offline shell. |

`docker` is unavailable in this verifier container, so an image build could not be run. The repository's exact Vite production build, static output, response configuration, and deployed static host were verified instead.

## Direct live product exercise

On both 1440×900 desktop and 390×844 mobile, the deployed candidate added events, moved a focused event with ArrowRight, navigated the month grid, switched views, and performed a real pointer resize. The corrected resize feedback accurately announced the changed end time. There were zero page errors and console errors. Visual inspection found the documented risograph layout intact; the phone view intentionally drops the decorative hero image and preserves the horizontal timeline rather than shrinking it.

Independent recovery and boundary checks on the live site also passed:

- Submitting an empty event title produced the bound live error: `Add a title so people know what is scheduled.`
- Filling the title after that error and selecting the boundary time `23:59` succeeded and announced `Boundary 23:59 added.`
- Delete produced `Morning briefing removed. Undo is available.` and Undo restored the event with an accurate notice.
- The skip link is first in keyboard order, focus is a visible cobalt 3 px outline, event Arrow movement and Delete/Undo work, and the month grid supports Arrow navigation.
- Reduced motion produces `scroll-behavior: auto` and `transition-duration: 0.00001s`.

### Defect

1. **P2 — core event resize cannot be performed keyboard-only.** In the deployed candidate, `site/src/main.tsx:179` makes the resize target an `aria-hidden="true"` `<i>` with no focusability; the event's keyboard handler at `site/src/main.tsx:162-168` supports movement only. Fresh browser inspection found the resize handle has `tabIndex: -1` and `ariaHidden: "true"`. It is therefore impossible to reach or operate the visible duration-changing handle using Tab, Enter/Space, or a documented key. Add an accessible resize control or keyboard duration-shortcut with accurate live feedback, document it, and add a browser regression test before release.

## Live identity, privacy, policy, and budget

The following SHA-256 digests matched exactly between the fresh local candidate build and `https://headless-scheduler.sociobot.in`:

| File | SHA-256 |
| --- | --- |
| `index.html` | `29520add7850e1b149e109be00760d3aadf1b696965a775b654eeef42ace5988` |
| `assets/index-BJfMCuE9.js` | `678ef264ceeb35af23d09b952d1ee1904cbb68785e87f48109541f65bf403f41` |
| `assets/index-D1Xy_nRN.css` | `831db0b0822793d06751eeddfc37a2d8514940c879244d8ef0f17da0ed094039` |
| `sw.js` | `4edee4bca8773036aff97755d30173d479a179ce57867613fd671cccbc2a6fba` |
| `manifest.webmanifest` | `29cb3e92c00d82a7d836f560587e00635f4e113f6c65844c692a1a96c7235ac0` |

Live `check:smoke`, `check:a11y`, `check:headers`, and `check:offline` all pass. Axe returned zero total WCAG 2 A/AA + 2.1 AA violations, therefore zero serious/critical findings.

The first-load request log contained only same-origin resources. There are no cookies, local storage, session storage, or IndexedDB databases; the only browser cache entry is the versioned service-worker shell cache. No analytics, telemetry, runtime CDN, or third-party request was observed. `/privacy/` and `/terms/` returned 200.

Live HTTPS responses include HSTS, a self-only CSP (`connect-src 'self'`, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, Permissions-Policy, COOP, and CORP. HTML/deep links are `no-store`, hashed JS is one-year immutable, and the worker is `no-cache, no-store, must-revalidate`.

Measured candidate assets are within the stated budgets: entry JS is 46,460 B raw / 16,937 B gzip (under 200 KB), CSS is 17,120 B raw / 4,576 B gzip (under 50 KB), and the hero WebP is 198,634 B (under 300 KB). Lighthouse was not run because it is not present in the repository and Docker is unavailable; targeted browser performance-budget, accessibility, and response checks passed.

## Required re-verification after repair

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
npm run check:a11y -- https://headless-scheduler.sociobot.in
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:offline -- https://headless-scheduler.sociobot.in
```
