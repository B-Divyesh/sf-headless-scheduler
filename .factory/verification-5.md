# Independent verification 5 — FAIL

Date: 2026-08-27
Candidate: `5ca70f4bf66fbabb48193e31dad7c7eb18a45cba`
Live URL: <https://headless-scheduler.sociobot.in>

## Verdict

**FAIL — do not release unchanged.** The earlier deployment-only mismatch is resolved: the live static deployment is an exact byte match for this candidate, and the package, core API, PWA, accessibility, privacy, response-policy, and performance checks pass. However, the primary resize interaction gives an incorrect visible and screen-reader status result. Resizing an event changes its end time correctly but announces the unchanged start time. This violates the required immediate, accurate action feedback for a scheduler operation.

No product source was changed by this verification. The only changes in this checkout are this report, the requested handoff update, and refreshed zero-violation axe evidence timestamps.

## Clean candidate and release-package checks

The checkout was clean at the requested SHA before `npm ci --ignore-scripts --no-audit --no-fund`. Node installed the lockfile's 147 packages. There is no lint script in `package.json`; `npm run check` is the available strict TypeScript check.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | Vitest: 1 file, **26/26** tests passed. |
| `npm run check` | PASS | Both library and documentation TypeScript projects passed. |
| `npm run build` | PASS | Exact library and static-site production build completed. |
| `npm run check:pack` | PASS | Fresh temp consumer installed the packed tarball; ESM, CJS, React export, all seven declared artifacts, timezone regression and pointer-validation regression passed. |
| `npm pack --dry-run` | PASS | `prepack` built the library; 24 files, 40.0 kB tarball / 139.4 kB unpacked, with every declared entry point, declarations and CSS export. |
| `npm run check:smoke` | PASS | 390×844 and 1440×900 add-event, keyboard move, month navigation and Timeline flows passed with zero browser errors. |
| `npm run check:a11y` | PASS | Local self-hosted production axe WCAG 2 A/AA + 2.1 AA result: zero violations. |
| `npm run check:headers` | PASS | 10 local production response/caching/security checks passed. |
| `npm run check:offline` | PASS | Service-worker-controlled shell reloaded offline. |
| `npm run check:pwa-update` | PASS | Deterministic old-to-new worker/cache handoff and updated offline shell passed. |

The exact Docker production-image build could not be run because `docker` is not installed in this verifier container (`docker: command not found`). The repository's exact Vite production build and the live production static deployment were tested instead.

## Independent product exercise

Against the live candidate at both desktop and 390 px mobile:

- Normal use passed: add event, switch Day/Week/Month/Timeline, pointer move, delete, Undo restore, and keyboard ArrowRight event movement.
- Boundary use passed: an event at `23:59` was accepted and status announced its creation (it is appropriately outside the demo's displayed 07:00–17:00 range).
- Invalid/recovery use passed: a blank title announces `Add a title so people know what is scheduled.`; entering a title then submits successfully.
- Keyboard and responsive smoke passed with no document horizontal overflow; the app has its skip link, one H1, main landmark, title and `lang=en`. Focus styling is the designed 3 px cobalt `:focus-visible` ring. Reduced motion yields `scroll-behavior: auto` and `0.00001s` event transitions.
- Axe found zero total WCAG 2 A/AA + 2.1 AA violations locally and live, hence zero serious/critical findings. Browser page and console errors were zero.
- The actual resize action was separately exercised after scrolling it into view. Desktop changed Morning briefing from **08:30–10:00** to **08:30–10:45**; mobile changed it to **08:30–10:15**. The interaction, pointer capture and responsive handle all work.

## Defect

1. **P2 — resize completion feedback reports the wrong time.** In the live candidate and source at `site/src/main.tsx:157`, the resize commit calls `setNotice(... value.start ...)`. A resize-end changes `value.end`, so the resulting live region/status says `Morning briefing resized to 8:30 AM.` even after its end becomes 10:45 AM (desktop) or 10:15 AM (mobile). The user and assistive-technology user receive a false result for a core action. Announce the changed end time (or an accurate before/after range), add a regression test for the status text, then rerun this verification.

## Live deployment identity, privacy, policy and budget

The deployment is the requested candidate, byte-for-byte:

| File | SHA-256 (local = live) |
| --- | --- |
| `index.html` | `82b0403865d415d8e05a890bb30b04ce0bad3447de792b6a65feb665e55275fc` |
| `assets/index-DenlCzG3.js` | `79da8d9c21a0fc655377cfa9f8083fef1c57f5c00e3667ef530bdf613c57a5b6` |
| `assets/index-D1Xy_nRN.css` | `831db0b0822793d06751eeddfc37a2d8514940c879244d8ef0f17da0ed094039` |
| `sw.js` | `aafbfc448096e27b34f6837f1929c14d3345fdba6fc031efb4245883373866c2` |
| `manifest.webmanifest` | `29cb3e92c00d82a7d836f560587e00635f4e113f6c65844c692a1a96c7235ac0` |

Live `check:smoke`, `check:a11y`, `check:headers`, and offline reload all pass. First-load browser requests are same-origin only. Review of the source, bundle behavior and browser request log found no analytics, telemetry, cookies, local/session storage, IndexedDB writes, runtime CDN or data API; the GitHub URLs are user-initiated links. Live `/privacy/` and `/terms/` are 200 and accurately describe the in-memory demo and consumer-owned storage.

HTTPS sends HSTS, CSP (`connect-src 'self'`, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, Permissions-Policy, COOP and CORP. HTML and deep-link responses are no-store; hashed assets are one-year immutable; the service worker is no-cache/no-store; the manifest is `application/manifest+json`.

Measured production assets remain within the contract: entry JS is 46,344 B raw / 16,932 B gzip (under 200 KB); CSS is 17,120 B raw / 4,599 B gzip (under 50 KB); the hero WebP is 198,634 B (under 300 KB). Lighthouse was not claimed: the repository has no Lighthouse dependency and Docker is unavailable, while the targeted browser, axe and measured-budget checks above passed.

## Re-run after remediation

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
npm run check:a11y -- https://headless-scheduler.sociobot.in .factory/evidence/axe-live.json
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:offline -- https://headless-scheduler.sociobot.in
```
