# Headless Scheduler

An MIT, headless TypeScript scheduler for product engineers building booking, staffing, and planning interfaces. It includes resource timelines and continuous month scrolling without a commercial view licence, and leaves the DOM and design system to you.

**v0.1.0** · framework-agnostic core · optional React adapter · zero core dependencies · ESM + CJS + declarations

## Install

```bash
npm install headless-scheduler
```

React is an optional peer dependency. The Temporal adapter works with native `Temporal` or `@js-temporal/polyfill`; the date-fns adapter accepts the date-fns functions you already ship.

## Usage

```ts
import { createScheduler, nativeDateAdapter } from 'headless-scheduler'

const scheduler = createScheduler({
  dateAdapter: nativeDateAdapter,
  initialView: 'resource-timeline',
  visibleRange: { start: '2026-08-27T08:00:00Z', end: '2026-08-27T18:00:00Z' },
  resources: [
    { id: 'room-a', title: 'Room A' },
    { id: 'room-b', title: 'Room B' }
  ],
  events: [{
    id: 'kickoff', title: 'Kickoff', resourceId: 'room-a',
    start: '2026-08-27T09:00:00Z', end: '2026-08-27T10:30:00Z'
  }],
  onEventsChange(events, change) {
    // Persist in your own store. change.type is create, update, move, resize or remove.
  }
})

const unsubscribe = scheduler.subscribe(state => renderYourUI(state))
scheduler.moveEvent('kickoff', { resourceId: 'room-b', start: '2026-08-27T11:00:00Z' })
```

The documented example above is compiled and exercised by the test suite.

### React render prop

```tsx
import { HeadlessScheduler } from 'headless-scheduler/react'

<HeadlessScheduler options={options}>
  {({ state, scheduler, timeline }) => (
    <div role="grid" aria-label="Team schedule">
      {timeline.rows.map(row => (
        <div role="row" key={row.resource.id}>{row.resource.title}</div>
      ))}
    </div>
  )}
</HeadlessScheduler>
```

### Pointer interaction

```ts
import { createPointerInteraction } from 'headless-scheduler'

const drag = createPointerInteraction({
  mode: 'move', event, pixelsPerMinute: 2, snapMinutes: 15,
  onPreview: preview => paintPreview(preview),
  onCommit: preview => scheduler.moveEvent(event.id, preview)
})

element.addEventListener('pointerdown', drag.onPointerDown)
```

Use `mode: 'create'`, `'move'`, `'resize-start'`, or `'resize-end'`. Pointer capture keeps drags stable. Keyboard equivalents are available through `getGridNavigation`, and `scheduler.announce()` exposes changes for an `aria-live` region.

### Date adapters

```ts
import { createTemporalAdapter, createDateFnsAdapter } from 'headless-scheduler'

const temporal = createTemporalAdapter(Temporal)
const dateFns = createDateFnsAdapter({ addMinutes, startOfDay, startOfWeek, format })
```

Events use ISO strings at the public boundary. Supply offsets or `Z` for instants; `timeZone` controls labels and calendar boundaries. Recurrences must be expanded by the caller in v0.1.

### Tailwind theme

Import `headless-scheduler/preset.css` or copy it into your Tailwind `@layer components`, then override variables such as `--hs-paper`, `--hs-ink`, and `--hs-accent`. Stable `hs-*` hooks are provided, but the core never requires this DOM.

## Public API

- `createScheduler(options)` — observable event/view state and immutable CRUD/move/resize operations.
- `buildMonth`, `getContinuousMonthWindow` — calendar math and virtual month windows.
- `buildTimeGrid`, `buildResourceTimeline`, `layoutOverlaps` — view models with collision columns.
- `createPointerInteraction` — pointer create/move/resize with snapping.
- `getGridNavigation` — Arrow/Home/End/PageUp/PageDown keyboard intent.
- `nativeDateAdapter`, `createTemporalAdapter`, `createDateFnsAdapter` — replaceable date math.
- `HeadlessScheduler`, `useScheduler` from `/react` — optional React bindings.

All exported types are emitted in `dist/`. See the live API and interactive example at https://headless-scheduler.sociobot.in.

## Develop, test, and deploy

```bash
npm install
npm test
npm run build         # library + static docs
npm run build:site    # static docs -> dist/site (index.html at root)
npm pack --dry-run
npm run check:pack    # clean pack + fresh ESM/CJS consumer install
npm run check:offline # production shell reload while offline
npm run check:pwa-update # two-version service-worker update regression
npm run check:smoke   # self-hosted production browser smoke check
```

`npm pack` and `npm publish` run the library build through `prepack`, so every declared ESM, CJS, declaration, React, and CSS export exists in a clean tarball. `npm run dev` serves the documentation site. The static `dist/site` directory can be deployed as-is; it includes `staticwebapp.config.json` for Static Web Apps cache and security headers plus a build-generated service worker that precaches the emitted shell. No analytics, accounts, cookies, local storage, third-party fonts, or runtime CDNs are used.

For the production container used by the factory deployment:

```bash
docker build -t headless-scheduler .
docker run --rm -p 8080:8080 headless-scheduler
```

It builds `dist/site` in a separate stage, then serves it on port 8080 as a non-root user. The runtime applies SPA fallback, no-store HTML responses, immutable caching for Vite's hashed assets, PWA-aware service-worker caching, and browser security headers.

## Browser and framework support

Evergreen browsers with ES2022 and Pointer Events. The package ships ESM and CJS. React 18/19 is supported as an optional peer; Vue and Svelte adapters are intentionally outside v0.1, while the core works in either.

## Contributing

Run `npm test` and `npm run build:site` before opening a change. Please add a focused regression test for behavioral changes. Security issues should be reported privately to the repository owner.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
