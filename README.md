# Headless Scheduler

Headless Scheduler is a TypeScript scheduling library for booking, staffing, and planning interfaces. It supplies behavior and typed view data, not UI components.

Version 0.1.0 includes day, week, continuous month, and resource timeline models under the MIT license. The core package has no runtime dependencies. A React adapter is optional.

## Try the package

Open the [isolated sample playground](https://headless-scheduler.sociobot.in/?demo=1). You can edit sample JSON, move or resize events, switch views, and reset the demo. Demo edits stay in memory and clear on reload or reset.

## Install the release file

The npm registry name is not published yet. Install the versioned package file served by this release:

```bash
npm install https://headless-scheduler.sociobot.in/headless-scheduler-0.1.0.tgz
```

The tarball provides ESM, CommonJS, TypeScript declarations, optional React bindings, and the preset CSS file.

## Create a scheduler

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
    // Connect your own store here.
  }
})

const unsubscribe = scheduler.subscribe(state => renderYourUI(state))
scheduler.moveEvent('kickoff', { resourceId: 'room-b', start: '2026-08-27T11:00:00Z' })
```

The `@claim:readme-example` test runs this example.

### Use React

```tsx
import { HeadlessScheduler } from 'headless-scheduler/react'

<HeadlessScheduler options={options}>
  {({ timeline }) => (
    <div role="grid" aria-label="Team schedule">
      {timeline.rows.map(row => (
        <div role="row" key={row.resource.id}>{row.resource.title}</div>
      ))}
    </div>
  )}
</HeadlessScheduler>
```

### Handle pointer input

```ts
import { createPointerInteraction } from 'headless-scheduler'

const drag = createPointerInteraction({
  mode: 'move', event, pixelsPerMinute: 2, snapMinutes: 15,
  onPreview: preview => paintPreview(preview),
  onCommit: preview => scheduler.moveEvent(event.id, preview)
})

element.addEventListener('pointerdown', drag.onPointerDown)
```

Create, move, or resize interactions at fixed time intervals. Use `getGridNavigation` to map Arrow, Home, End, Page Up, and Page Down keys to grid positions.

### Choose date calculations

Use the built-in adapter, native Temporal, its polyfill, or supplied date-fns functions. Pass event dates as ISO strings with an offset or `Z`.

Version 0.1 does not expand recurring events. Expand them before passing events to the library.

### Style the example

Import `headless-scheduler/preset.css` or copy it into your Tailwind component layer. Override its `--hs-*` variables, or render different markup from the returned view data.

## Public API

- `createScheduler` creates state and returns create, update, move, resize, and remove methods.
- `buildMonth` and `getContinuousMonthWindow` calculate month data.
- `buildTimeGrid`, `buildResourceTimeline`, and `layoutOverlaps` calculate event positions.
- `createPointerInteraction` handles pointer create, move, and resize actions.
- `getGridNavigation` maps keyboard input to grid positions.
- Date adapters provide built-in, Temporal, or date-fns calculations.
- `HeadlessScheduler` and `useScheduler` provide optional React bindings.

## Develop, test, and deploy

```bash
npm ci
npm test
npm run check
npm run check:claims
npm run build
npm run test:claims
npm run check:pack
npm run check:smoke
npm run check:a11y
npm run check:offline
npm run check:pwa-update
npm run check:headers
```

`npm run build` writes the package to `dist/package` and the static site to `dist/site`. The site output includes the installable tarball and route files.

The documentation site uses no analytics, accounts, cookies, local storage, third-party scripts, remote fonts, or runtime CDNs. The service worker uses Cache Storage for offline pages and assets.

The package includes no telemetry or network calls. Applications choose how to store scheduler data.

## Support and scope

The package build targets ES2022 and pointer interactions use the Pointer Events API. The release contains ESM and CommonJS builds plus declarations. React 18 and 19 can use the optional adapter.

Vue and Svelte adapters, recurrence expansion, iCal parsing, printing, and a hosted builder are outside version 0.1.

Report security issues privately through the repository owner’s GitHub profile.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
