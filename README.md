# Headless Scheduler

Headless Scheduler is a TypeScript scheduling library for booking, staffing, and planning interfaces. It supplies behavior and calendar data, not UI components.

Version 0.1.0 includes day, week, continuous month, and resource timeline models under the MIT license. The core works without installing other packages. A React adapter is optional.

## Try the package

Open the [demo](https://headless-scheduler.sociobot.in/?demo=1). The demo opens with rooms, people, and scheduled work. You can edit sample JSON, move or resize events, switch views, and reset the demo. Demo edits stay in memory and clear on reload or reset.

## Install the release file

Install the v0.1.0 release file from this site:

```bash
npm install https://headless-scheduler.sociobot.in/headless-scheduler-0.1.0.tgz
```

The download supports JavaScript `import` and `require`, includes TypeScript types and CSS, and adds React support only when requested.

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

Choose the built-in date handling, Temporal, or date-fns. Pass complete ISO dates such as `2026-08-27T09:00:00Z`.

Version 0.1 does not expand recurring events. Expand them before passing events to the library.

### Style the example

Import the preset CSS or copy it into Tailwind. Change its `--hs-*` colors, or render your own HTML from the calendar data.

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

`npm run build` writes the package to `dist/package` and the static site to `dist/site`. The site output includes the v0.1.0 release file and route files.

The documentation site does not load scripts, fonts, or other files from third-party sites. The service worker uses Cache Storage for offline pages and assets.

The package includes no telemetry or network calls. Applications choose how to store scheduler data.

## Support and scope

The package build targets ES2022 and pointer interactions use the Pointer Events API. The release contains ESM and CommonJS builds plus declarations. React 18 and 19 can use the optional adapter.

Vue and Svelte adapters, recurrence expansion, iCal parsing, printing, and a hosted builder are outside version 0.1.

Report security issues privately by following [SECURITY.md](SECURITY.md). Do not open a public issue for a security report.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
