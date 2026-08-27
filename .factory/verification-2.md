# Independent verification 2 — FAIL

Date: 2026-08-27  
Candidate: `52818543dc3652193206659a85d9c2f6453695ad`  
Live URL: <https://headless-scheduler.sociobot.in>

## Verdict

**FAIL.** The core package, fresh consumer installation, documentation app,
accessibility, security headers, privacy claims, offline reload, and live
deployment identity all passed. The candidate is not releasable as its
documented PWA because its own deterministic old-to-new service-worker update
test fails reproducibly: after the new worker/cache is active, a newly opened
client still renders the old documentation release. This violates the required
service-worker update exercise and can leave users on stale docs/app shell.

The live deployment is an exact byte match for the candidate build, so this is
not a deployment-only discrepancy. No product source was changed during
verification.

## Clean candidate and package verification

Created a detached worktree at the exact SHA, then ran `npm ci` under Node
`v22.23.2`. Installation added 145 packages and `npm audit` reported zero
vulnerabilities.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | 1 test file; 10/10 tests passed. |
| `npm run check` | PASS | Library and site TypeScript checks passed. No lint script is defined. |
| `npm run build` | PASS | Produced `dist/package` and `dist/site`; generated a 12-entry precache worker. |
| `npm run check:pack` | PASS | Deletes `dist/package`, packs through `prepack`, installs into a fresh consumer, and imports core/React in ESM and CJS; all 7 declared entry artifacts found. |
| Independent packed API exercise | PASS | A new consumer installed the `30,440 B` tarball. Normal resource move, range clipping, continuous-month window, ESM, CJS, React export, malformed ISO/range rejection all behaved as documented. |

The production artifacts are within the stated static budgets: initial JS
44,855 B, CSS 17,120 B, and hero WebP 198,634 B (all raw emitted sizes; limits
are 200 KB, 50 KB, and 300 KB respectively). Core has zero runtime
dependencies. The package contains the declared ESM, CJS, declaration, React,
and preset exports.

## Product exercise and accessibility

Local production preview and the live URL were exercised at 390 × 844 and
1440 × 1000 with Playwright.

- Normal path: add event, timeline/day/week/month view switching, keyboard
  ArrowRight event movement, delete and Undo restoration all passed.
- Boundary path: a 12-hour event crossing both edges of a 10-hour resource
  timeline clipped to 10% left / 90% width and flagged its clipped end;
  continuous month overscan included the anchor and prior month.
- Malformed/recovery path: invalid ISO dates and inverted ranges threw; a blank
  event title announced “Add a title so people know what is scheduled.”,
  then a corrected title added successfully.
- Keyboard and focus: Tab reaches the skip link; desktop focus rendered as
  `rgb(36, 86, 166) solid 3px`; modal focus reached the title input; month-grid
  Arrow navigation and event Arrow movement worked. No 390 px or desktop page
  horizontal overflow.
- Reduced motion resolved transition duration to `0.00001s` and scroll behavior
  to `auto`.
- `npm run check:a11y -- <local/live>` returned zero WCAG 2 A/AA and 2.1 AA
  violations (therefore zero serious/critical findings). Browser page/console
  errors were zero in the independent normal, malformed, recovery, keyboard,
  desktop and mobile exercises.

`npm run check:smoke -- https://headless-scheduler.sociobot.in` did fail once
at its immediate post-click dialog-focus assertion. The same live flow passed
when waiting for React's modal effect: input focus, invalid-title error,
recovery, keyboard move, and Undo all succeeded with no browser errors. This
is a racy smoke assertion rather than evidence of a user-visible focus failure,
but it is still a P2 test reliability defect.

## PWA result

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run check:offline` | PASS | Cached-shell offline reload rendered the H1 while service-worker controlled. |
| Live offline reload | PASS | Worker `headless-scheduler-docs-31a159b760b43da2` controlled the page and offline reload rendered “Your schedule. Your surface.” |
| `npm run check:pwa-update` | **FAIL twice** | Builds `old-build` and `new-build`, confirms the new cache revision and removal of old cache, then fails: `Updated service worker did not serve the new shell`. |

The failing update test is not a weak assertion: it verifies the new worker
cache directly contains the `new-build` index before opening a new client. That
client nevertheless receives the old release marker. Fix the worker/navigation
update behavior and keep this exact two-version regression test green before
release.

## Live deployment identity, privacy, security, and caching

The live deployment matches the candidate output byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `index.html` | `e922952b296ee081a67b6179d4853cfdeaa90495267e52f8a2e654f161fd1198` |
| `assets/index-DUheX0I6.js` | `9bdc94d2ac21560828e4f4b38a005760c717b6f1c9757c732eac8153a1012394` |
| `assets/index-D1Xy_nRN.css` | `831db0b0822793d06751eeddfc37a2d8514940c879244d8ef0f17da0ed094039` |
| `sw.js` | `f0c754ee74315d9602c542940e80de8849e5c98a7b6d23b900ff671dbd5f299b` |

`npm run check:headers -- https://headless-scheduler.sociobot.in` passed all
eight checks: no-store HTML, immutable hashed JS, no-cache worker, CSP with
`frame-ancestors 'none'`, `X-Frame-Options: DENY`, Permissions-Policy, COOP,
and CORP. HTTPS/HSTS, `nosniff`, and strict-origin referrer policy are also
present. Root, legal pages, worker, and an SPA deep link returned HTTP 200.

Initial browser resource requests were same-origin only. Static/source review
found no analytics, telemetry, cookies, local/session storage, indexedDB,
runtime CDN, or network API use; the only external URLs are user-initiated
GitHub links. `/privacy/` and `/terms/` are live and accurately describe the
in-memory demo and consumer-owned persistence.

Lighthouse CLI was attempted against live with the installed Chromium, but its
tab crashed before reporting results in this container. This does not replace
the passed axe/browser/budget checks above.

## Defects

1. **P1 — PWA update regression.** `npm run check:pwa-update` fails
   reproducibly. An old-to-new documentation deployment can leave a newly
   opened service-worker client on the old shell even after the new cache is
   active. Resolve the navigation/update lifecycle and require this command in
   CI.
2. **P2 — live smoke check has a modal-focus race.** The live command's
   immediate focus assertion can run before React's dialog effect, although the
   actual focus/recovery path passes after the modal opens. Wait for focused
   input rather than asserting synchronously so deployment verification is
   deterministic.

## Re-run

```bash
git worktree add --detach /tmp/headless-scheduler-verify 52818543dc3652193206659a85d9c2f6453695ad
cd /tmp/headless-scheduler-verify
npm ci
npm test
npm run check
npm run build
npm run check:pack
npm run check:headers
npm run check:offline
npm run check:pwa-update # currently fails: old shell is served after update
npm exec -- vite preview --config site/vite.config.ts --host 127.0.0.1 --port 4268
npm run check:a11y -- http://127.0.0.1:4268 .factory/axe-local.json
npm run check:smoke -- http://127.0.0.1:4268
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in .factory/axe-live.json
```
