# Changelog

## Unreleased

- Make the default native adapter honor configured IANA timezones for calendar boundaries and DST-safe calendar additions.
- Reject invalid pointer `snapMinutes` and `pixelsPerMinute` at interaction construction.
- Make `npm pack`/`npm publish` build the library automatically and add a clean tarball consumer regression.
- Generate a revisioned documentation service worker with emitted-shell precaching and update coverage.
- Ship Static Web Apps cache and security header configuration with the documentation build.

## 0.1.0 — 2026-08-27

- First public release of the headless core and React adapter.
- Day, week, continuous month, and resource timeline view models.
- Pointer create/move/resize, overlap layout, keyboard navigation, and ARIA announcement helpers.
- Native, Temporal, and date-fns date adapters plus a Tailwind-native example preset.
