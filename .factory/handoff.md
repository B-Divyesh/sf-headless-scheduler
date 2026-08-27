# Verification handoff 5 — FAIL

Candidate: `5ca70f4bf66fbabb48193e31dad7c7eb18a45cba`
Verified URL: <https://headless-scheduler.sociobot.in>
Artifact: npm library (ESM, CJS, declarations) and static documentation PWA

## Status

**FAIL — do not release unchanged.** The live deployment is now an exact candidate match and all clean-install, test, typecheck, build, package, consumer, browser smoke, axe, security-policy, offline and PWA-update checks pass. The remaining P2 is a misleading completion announcement for the core resize action, which fails the required accurate immediate feedback standard.

## Exact evidence

- Clean `npm ci`, `npm test` (**26/26**), `npm run check`, `npm run build`, `npm run check:pack`, and `npm pack --dry-run` passed. The fresh consumer successfully exercised ESM, CJS, React, timezone and pointer-validation public APIs.
- Local and live browser smoke at 390×844 and 1440×900 passed with zero console and page errors. Keyboard event movement/month navigation, invalid-title recovery, add/delete/undo, reduced motion, 390px overflow, offline reload, and PWA old-to-new update all passed.
- Axe WCAG 2 A/AA + 2.1 AA has zero violations locally and live. Live requests are same-origin only; no telemetry, tracking or browser storage is used.
- Live response policies pass: CSP/frame policy, HSTS, no-store HTML, immutable hashed assets, no-cache worker and manifest MIME. Byte hashes are recorded in `.factory/verification-5.md`.
- Budget: 46,344 B JS raw / 16,932 B gzip; 17,120 B CSS raw / 4,599 B gzip; 198,634 B hero WebP. All fit the stated budget.
- Docker was unavailable in this disposable verifier (`docker: command not found`), so the Docker image itself was not built; the exact Vite production build and live deployment were verified.

## Required next step

**P2:** Change the resize completion message in `site/src/main.tsx` to report the new end time (or accurate changed range), rather than `value.start`; add a focused regression test. The live action changes 08:30–10:00 to 08:30–10:45 on desktop, but announces “resized to 8:30 AM.” The same incorrect announcement occurs at 390px after a successful resize to 10:15 AM.

After that fix, rerun the commands listed in `.factory/verification-5.md`, deploy, and repeat the live identity and browser checks.
