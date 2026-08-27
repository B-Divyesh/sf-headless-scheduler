# Verification handoff — PASS

Repaired independent verifier-2 findings from candidate
`52818543dc3652193206659a85d9c2f6453695ad` on 2026-08-27.

## What changed

- Documentation navigations are network-first during a service-worker hand-off,
  with the versioned precached shell retained as the offline fallback. An old
  worker can no longer paint its old `/index.html` into a newly opened tab after
  a docs deployment.
- `check:pwa-update` now builds distinct old/new shells, verifies activation,
  cache replacement, the new page's release marker and controller cache, then
  reloads that new page offline to prove the new cached shell is used.
- `check:smoke` waits for the open modal's title input to actually become the
  active element, rather than racing the dialog effect. With no URL argument it
  now serves `dist/site` itself, so it is deterministic in automation; an
  explicit URL continues to exercise a live deployment.

## Verified

From a clean `npm ci` install (0 audit vulnerabilities):

```bash
npm test                                      # 10/10 unit tests
npm run check                                 # library + docs TypeScript
npm run build                                 # dist/package + dist/site
npm run check:pack                            # clean tarball + ESM/CJS/React consumer
npm run check:headers                         # 8 static-header checks
npm run check:offline                         # cached-shell offline reload
npm run check:pwa-update                      # old-to-new fresh-client + offline regression
npm run check:smoke                           # self-hosted 390px browser flow, no errors
npm run check:a11y -- http://127.0.0.1:4268 .factory/evidence/axe-repair-local.json
npm run check:headers -- https://headless-scheduler.sociobot.in
npm run check:smoke -- https://headless-scheduler.sociobot.in
npm run check:a11y -- https://headless-scheduler.sociobot.in .factory/evidence/axe-repair-live.json
```

Both local and live axe runs reported zero WCAG 2 A/AA and 2.1 AA violations.
The PWA old-to-new regression was additionally run five consecutive times.

## Release

`dist/site` is the Standard static-docs artifact. Publish the committed `main`
branch through the factory's static deployment path; do not publish the npm
package from this worker (`npm pack` remains the ready-to-publish validation).

Known gaps: the live URL checks above verify the currently deployed baseline;
the repaired service-worker behavior is covered locally by the two-version
regression and becomes live with this static-docs commit.
