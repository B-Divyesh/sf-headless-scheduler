# Independent verification 1 — FAIL

Date: 2026-08-27  
Candidate: `e0eb03892ce86e6131fea0fd3f2f776a35b7a1c1`  
Live URL: <https://headless-scheduler.sociobot.in>

## Verdict

**FAIL.** The scheduler core and documentation application work in the tested
normal, boundary, malformed-input, recovery, desktop, mobile, keyboard, and
accessibility paths. However, a clean checkout's direct `npm pack` produces a
non-functional four-file tarball: no library artifacts are included. This is a
release blocker for an npm library and means the candidate is not
ready-to-publish. The live deployment also lacks important documented security
headers and immutable caching for hashed assets.

No product source files were modified during this verification.

## Clean candidate checkout

Created a detached clean worktree at the exact candidate SHA and ran `npm ci`:
146 packages installed, `npm audit` reported 0 vulnerabilities.

| Check | Result | Evidence |
| --- | --- | --- |
| `npm test` | PASS | 1 file, 10 tests passed |
| `npm run check` | PASS | Library and site TypeScript checks passed |
| `npm run build` | PASS | Built ESM, CJS, declarations, Tailwind preset, and `dist/site` |
| Production budget | PASS | Initial JS 44,249 B; CSS 16,723 B; hero WebP 198,634 B (under 200 KB / 50 KB / 300 KB limits) |
| Direct `npm pack --dry-run` before build | **FAIL** | Only `README.md`, `LICENSE`, `CHANGELOG.md`, and `package.json` were packed (3.9 kB); all `dist/package` entry points declared by `package.json` were absent |
| `npm pack` after manual build | PASS, conditional | 24 files, 29.8 kB package / 121.3 kB unpacked |
| Clean consumer after manual build | PASS, conditional | Installed tarball into a fresh temp consumer; ESM normal/boundary/malformed API exercise and CJS import both passed |

The package lacks a `prepack`/`prepare`/`prepublishOnly` build lifecycle. Since
`dist/` is not committed and `files` explicitly selects `dist/package`, a
publisher running `npm pack` or `npm publish` from a freshly cloned candidate
without first manually running `npm run build` ships a package with broken
`main`, `module`, `types`, and `exports` targets. README ordering does not make
the artifact publish-safe. Add a lifecycle build and a CI clean-pack consumer
test before release.

## Product exercise

Using the packed package after the production build:

- README-style resource move preserved a one-hour event duration and computed
  the expected 30% timeline offset.
- Invalid event ISO timestamps and invalid pointer-interaction timestamps both
  threw rather than being accepted.
- ESM and CommonJS public imports both exposed usable `createScheduler` APIs.

Against a local production preview and the live URL:

- 390 x 844 and 1440 x 1000 pages had no horizontal overflow or page/console
  errors.
- Add-event validation announced `Add a title so people know what is
  scheduled.`; supplying a title recovered successfully. Delete followed by
  Undo restored the event.
- Keyboard-only smoke passed add event, ArrowRight event movement, month-grid
  arrow navigation, and Timeline switching. Tab focus was visibly a 3 px
  cobalt outline on the skip link, navigation, and actions.
- `prefers-reduced-motion: reduce` resolved event transitions to `0.00001s`
  and document scrolling to `auto`.
- `axe-core` WCAG 2 A/AA and 2.1 AA checks found zero violations locally and
  live. The repository's mobile smoke script also passed live with zero browser
  errors.
- Initial live page requests went only to
  `https://headless-scheduler.sociobot.in`; source inspection found no
  analytics, cookies, storage, runtime CDN, or library network request. The
  privacy and terms pages are present and match those claims.

The PWA registered successfully. On the live deployment, after a controlled
reload, a fully offline reload rendered the cached H1 successfully. The service
worker has an update weakness: its cache name is permanently
`headless-scheduler-v1`, and its script is not build-versioned or generated
from the hashed assets. A documentation-only deploy that changes the bundle
but not `sw.js` does not trigger a new service-worker installation, allowing
the old cached document to keep selecting old assets. Version/inject the worker
and add an automated two-version update test.

## Candidate/live identity

The live deployment is the candidate static build, not merely visually similar.
SHA-256 comparisons were identical for:

- `index.html`: `69dbaeccdb7a82d957ae9108974d1378ec6936be6bc27490ec1c3a39c49e87d0`
- `assets/index-CoOGMOFg.js`: `251de581c8e854331051ce4b0ec5ac09470300e71723014f065584721a658502`
- `sw.js`: `646b3e86e0ac0845e6da76f550c976060e2c7a96596c6de34fa48743ee839dc5`
- `privacy/index.html`: `148d765400d49e92438d23e20d23c2d08fe518bd15f27f16b9bce2ac8cde3bb1`

Deep-link `/verification-deep-link` also returned the same SPA document with
HTTP 200.

## Live security and caching

HTTPS, HSTS, `nosniff`, and `strict-origin-when-cross-origin` are present.
The live response does **not** match the stronger security/caching claims in
the existing handoff: root document, privacy page, hashed JavaScript asset,
and `sw.js` all returned `Cache-Control: public, must-revalidate, max-age=30`.
It did not return immutable asset caching or a no-store/no-cache service worker.

It also omits a Content-Security-Policy, clickjacking protection
(`frame-ancestors` or `X-Frame-Options`), Permissions-Policy, COOP, and CORP.
The absent CSP/frame policy is a medium-severity deployment hardening defect;
the non-immutable hashed assets and cacheable service worker are medium
performance/update defects. These are live-environment observations, not
claims inferred from repository configuration.

## Defects

1. **P1 / release blocker — package is not publish-safe from a clean clone.**
   `npm pack --dry-run` before a manual build emits only four metadata files,
   so consumers receive missing entry points. Add lifecycle build automation
   and a clean tarball-install CI test.
2. **P2 — service-worker release update is not versioned.** The fixed cache
   name and non-generated worker can leave established clients on stale cached
   application shells after a bundle-only deployment. Generate/inject a build
   revision, precache revisioned assets, and test an old-to-new update.
3. **P2 — live security headers and cache policy do not meet the stated
   deployment contract.** Add CSP/frame/permissions/isolation policies and
   serve hashed assets immutable while serving `sw.js` with no-cache/no-store.

## Re-run commands

```bash
git worktree add --detach /tmp/headless-scheduler-verify e0eb03892ce86e6131fea0fd3f2f776a35b7a1c1
cd /tmp/headless-scheduler-verify
npm ci
npm test
npm run check
npm run build
npm pack --dry-run
npm exec -- vite preview --config site/vite.config.ts --host 127.0.0.1 --port 4267
npm run check:a11y -- http://127.0.0.1:4267 .factory/axe-local.json
npm run check:smoke -- http://127.0.0.1:4267
npm run check:a11y -- https://headless-scheduler.sociobot.in .factory/axe-live.json
npm run check:smoke -- https://headless-scheduler.sociobot.in
```
