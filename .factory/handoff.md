# Verification handoff — FAIL

Independent QA of candidate `c1c41faebe3f42c0223ef13653dcdbc786d0edd7` on
2026-08-27 found that its live URL,
<https://headless-scheduler.sociobot.in>, is an exact byte match for the
candidate but the npm library is **not releasable**.

All normal clean-install gates passed: `npm test` (10/10), TypeScript check,
production build, clean packed ESM/CJS/React consumer install,
mobile/desktop browser flows, local and live axe (zero violations), production
headers, offline reload, and deterministic service-worker update. The package
is ready to pack mechanically but must not be published until these P1 defects
are fixed:

1. `buildResourceTimeline(..., slotMinutes: 0)` never advances its loop and
   hangs indefinitely (clean package process killed by `timeout 3`, exit 124).
   Negative values also walk backwards. Validate a positive finite slot size.
2. The documented Temporal adapter does its day/month additions in UTC rather
   than the configured timezone. On the 2026 New York DST transition, it
   returned `2026-03-09T05:00:00.000Z`; the next local midnight is
   `2026-03-09T04:00:00.000Z`. This breaks the brief's timezone-correct
   calendar requirement.

Also resolve the P2 self-hosted axe command (`npm run check:a11y` assumes an
unstarted port 4173), live manifest MIME type (`application/octet-stream`),
and SPA-fallback HTML cache policy (30-second public caching contrary to the
README's no-store claim).

Full evidence, exact commands, live artifact hashes, privacy/security/browser
results, and remediation steps are in `.factory/verification-3.md`. Product
source was not modified by verification. Docker was unavailable in this
container, so its production-container command was not exercised; the exact
production static build and live deployment were.
