# Adversarial first-read review 2 handoff — FAIL

Date: 2026-08-28

Work order: `headless-scheduler-review-2`

Reviewed commit: `5e9933d4b3548a7b7fbaf2b069970af4bbec4087`

Live URL: <https://headless-scheduler.sociobot.in>

## Delivered

- Wrote `.factory/review-2.md` with the cold mobile/desktop read, landing and README copy inventory, demo/isolation checks, claim matrix, live structure/accessibility checks, history verification, missed-leverage review, and FAIL verdict.
- Added cold mobile, cold desktop, mobile demo, URL-verifier, and live axe evidence under `.factory/evidence/`.
- Did not modify product code.

## Verification

- Fresh clone: `npm ci`, `npm run build`, `npm run check:claims`, `npm run test:claims:each`, `npm test`, and `npm run check` passed.
- All 32 claim processes exited 0. Five do not fully exercise their registered promises; see F-2-1 through F-2-5.
- The live v0.1.0 release file installed and executed in a new temporary project.
- The live demo passed one-click sample, edit, Reset, reload clearing, empty persistent storage, same-origin requests, offline reload, and offline editing checks.
- Intended routes and crawled destinations passed; an unknown route returned the designed 404; no console errors, mobile overflow, or undersized targets were found.
- The factory URL verifier passed. Axe reported zero violations on Home, Demo, Privacy, Terms, and 404.

## Remaining work

The product is not review-complete. Blocking items are incomplete claim tests for the exact README example, package side effects, keyboard boundaries, offline sample behavior, and shipped licensing, plus the regressed plain-language finding. Additional findings cover terminology, two weak actions, missing Privacy in the header, first-screen facts, two unlisted claims, and security-reporting instructions. See `.factory/review-2.md` for exact rewrites and tests.
