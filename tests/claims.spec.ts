import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Temporal } from '@js-temporal/polyfill'
import {
  buildMonth, buildResourceTimeline, buildTimeGrid, createDateFnsAdapter,
  createPointerInteraction, createScheduler, createTemporalAdapter,
  getContinuousMonthWindow, getGridNavigation, layoutOverlaps,
  nativeDateAdapter, PACKAGE_VERSION, type PointerMode, type PointerPreview
} from '../src'

const sampleEvent = { id: 'kickoff', title: 'Kickoff', resourceId: 'room-a', start: '2026-08-27T09:00:00Z', end: '2026-08-27T10:30:00Z' }
const sampleRange = { start: '2026-08-27T08:00:00Z', end: '2026-08-27T18:00:00Z' }

async function installHostedPackage(request: { get(url: string): Promise<{ ok(): boolean; body(): Promise<Buffer> }> }, packages: string[] = []) {
  const response = await request.get('/headless-scheduler-0.1.0.tgz')
  expect(response.ok()).toBeTruthy()
  const consumer = mkdtempSync(join(tmpdir(), 'hs-claim-'))
  const tarball = join(consumer, 'headless-scheduler-0.1.0.tgz')
  writeFileSync(tarball, await response.body())
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball, ...packages], { cwd: consumer, stdio: 'ignore' })
  return consumer
}

test('@claim:release-package-installs', async ({ request }) => {
  const consumer = await installHostedPackage(request)
  try {
    const manifest = JSON.parse(readFileSync(join(consumer, 'node_modules/headless-scheduler/package.json'), 'utf8'))
    expect(manifest.version).toBe('0.1.0')
    execFileSync(process.execPath, ['--input-type=module', '--eval', "import { PACKAGE_VERSION, createScheduler } from 'headless-scheduler'; if (PACKAGE_VERSION !== '0.1.0' || createScheduler().getState().view !== 'week') process.exit(1)"], { cwd: consumer })
  } finally { rmSync(consumer, { recursive: true, force: true }) }
})

test('@claim:package-formats', async ({ request }) => {
  const consumer = await installHostedPackage(request)
  try {
    execFileSync(process.execPath, ['--input-type=module', '--eval', "import { createScheduler } from 'headless-scheduler'; if (typeof createScheduler !== 'function') process.exit(1)"], { cwd: consumer })
    execFileSync(process.execPath, ['--eval', "if (typeof require('headless-scheduler').createScheduler !== 'function') process.exit(1)"], { cwd: consumer })
    for (const file of ['index.js', 'index.cjs', 'index.d.ts', 'react.js', 'react.cjs', 'react.d.ts', 'preset.css']) {
      expect(existsSync(join(consumer, 'node_modules/headless-scheduler/dist/package', file))).toBeTruthy()
    }
  } finally { rmSync(consumer, { recursive: true, force: true }) }
})

test('@claim:typescript-declarations', async ({ request }) => {
  const consumer = await installHostedPackage(request)
  try {
    writeFileSync(join(consumer, 'consumer.ts'), `import { buildMonth, buildResourceTimeline, buildTimeGrid, createDateFnsAdapter, createPointerInteraction, createScheduler, createTemporalAdapter, getContinuousMonthWindow, getGridNavigation, layoutOverlaps, nativeDateAdapter, PACKAGE_VERSION, type SchedulerEvent } from 'headless-scheduler';\nconst event: SchedulerEvent = { id: 'a', title: 'A', start: '2026-08-27T09:00:00Z', end: '2026-08-27T10:00:00Z' };\nvoid [buildMonth, buildResourceTimeline, buildTimeGrid, createDateFnsAdapter, createPointerInteraction, createScheduler, createTemporalAdapter, getContinuousMonthWindow, getGridNavigation, layoutOverlaps, nativeDateAdapter, PACKAGE_VERSION, event];\n`)
    writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', strict: true, noEmit: true }, files: ['consumer.ts'] }))
    execFileSync(resolve('node_modules/.bin/tsc'), ['-p', join(consumer, 'tsconfig.json')], { cwd: resolve('.'), stdio: 'ignore' })
  } finally { rmSync(consumer, { recursive: true, force: true }) }
})

test('@claim:mit-license', async ({ request }) => {
  const consumer = await installHostedPackage(request)
  try {
    const installed = join(consumer, 'node_modules/headless-scheduler')
    const manifest = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'))
    expect(manifest.license).toBe('MIT')
    expect(readFileSync(join(installed, 'LICENSE'), 'utf8')).toContain('Permission is hereby granted, free of charge')
    execFileSync(process.execPath, ['--input-type=module', '--eval', "import { createScheduler } from 'headless-scheduler'; for (const view of ['day','week','month','resource-timeline']) { if (createScheduler({ initialView:view }).getState().view !== view) process.exit(1) }"], { cwd: consumer })
  } finally { rmSync(consumer, { recursive: true, force: true }) }
})

test('@claim:zero-runtime-dependencies', async () => {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
  expect(manifest.dependencies).toBeUndefined()
  expect(manifest.peerDependenciesMeta.react.optional).toBe(true)
})

test('@claim:package-playground', async ({ page }) => {
  await page.goto('/?demo=1')
  await expect(page.getByText(`v${PACKAGE_VERSION} package demo`)).toBeVisible()
  expect(readFileSync('site/vite.config.ts', 'utf8')).toContain("'headless-scheduler': resolve(__dirname, '../dist/package/index.js')")
  await expect(page.getByRole('heading', { name: 'Run this schedule locally' })).toBeVisible()
})

test('@claim:readme-example', async ({ request }) => {
  const readme = readFileSync('README.md', 'utf8')
  const match = readme.match(/## Create a scheduler\s*\n\n```ts\n([\s\S]*?)\n```/)
  const example = match?.[1]
  if (!example) throw new Error('Could not extract the README scheduler example')
  const consumer = await installHostedPackage(request)
  try {
    writeFileSync(join(consumer, 'example.ts'), example)
    writeFileSync(join(consumer, 'globals.d.ts'), 'declare function renderYourUI(state: unknown): void\n')
    writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', target: 'ES2022', strict: true, outDir: 'build' }, files: ['example.ts', 'globals.d.ts'] }))
    writeFileSync(join(consumer, 'run-example.mjs'), "let renders = 0; globalThis.renderYourUI = () => { renders += 1 }; await import('./build/example.js'); if (renders < 1) throw new Error('README subscription did not render'); const event = globalThis.__readmeScheduler?.getState().events[0]; if (event) throw new Error('README example unexpectedly leaked a global');")
    const source = readFileSync(join(consumer, 'example.ts'), 'utf8')
    expect(source).toBe(example)
    execFileSync(resolve('node_modules/.bin/tsc'), ['-p', join(consumer, 'tsconfig.json')], { cwd: resolve('.'), stdio: 'ignore' })
    const built = readFileSync(join(consumer, 'build/example.js'), 'utf8')
    expect(built).toContain("scheduler.moveEvent('kickoff'")
    writeFileSync(join(consumer, 'run-example.mjs'), "let renders = 0; globalThis.renderYourUI = () => { renders += 1 }; const original = globalThis.console; await import('./build/example.js'); if (renders < 1) throw new Error('README subscription did not render'); void original;")
    execFileSync(process.execPath, ['run-example.mjs'], { cwd: consumer, stdio: 'ignore' })
    const compiled = `${built}\nexport { scheduler }\n`
    writeFileSync(join(consumer, 'build/example-for-assertion.mjs'), compiled)
    const output = execFileSync(process.execPath, ['--input-type=module', '--eval', "globalThis.renderYourUI=()=>{}; const {scheduler}=await import('./build/example-for-assertion.mjs'); const event=scheduler.getState().events[0]; if(event.resourceId!=='room-b'||event.start!=='2026-08-27T11:00:00.000Z'||event.end!=='2026-08-27T12:30:00.000Z') process.exit(1)"], { cwd: consumer })
    expect(output).toBeDefined()
  } finally { rmSync(consumer, { recursive: true, force: true }) }
})

test('@claim:scheduler-operations', async () => {
  const scheduler = createScheduler({ events: [sampleEvent] })
  const initial = scheduler.getState()
  scheduler.createEvent({ ...sampleEvent, id: 'second', title: 'Second' })
  scheduler.updateEvent('second', { title: 'Updated' })
  scheduler.moveEvent('second', { start: '2026-08-27T11:00:00Z' })
  scheduler.resizeEvent('second', { end: '2026-08-27T13:00:00Z' })
  scheduler.removeEvent('second')
  expect(scheduler.getState().events).toEqual(initial.events)
  expect(initial.events).toEqual([sampleEvent])
  expect(Object.isFrozen(initial)).toBeTruthy()
  expect(Object.isFrozen(initial.events)).toBeTruthy()
})

test('@claim:resource-layout', async () => {
  const clipped = { ...sampleEvent, start: '2026-08-27T07:00:00Z', end: '2026-08-27T09:30:00Z' }
  const timeline = buildResourceTimeline({ range: sampleRange, events: [clipped], resources: [{ id: 'room-a', title: 'Room A' }], adapter: nativeDateAdapter, slotMinutes: 60 })
  expect(timeline.slots).toHaveLength(10)
  expect(timeline.rows[0]?.events[0]).toMatchObject({ left: 0, width: 15, clippedStart: true, clippedEnd: false })
})

test('@claim:collision-layout', async () => {
  const overlap = { ...sampleEvent, id: 'review', start: '2026-08-27T10:00:00Z', end: '2026-08-27T11:00:00Z' }
  const positioned = layoutOverlaps([sampleEvent, overlap], sampleRange, nativeDateAdapter)
  expect(positioned.map(event => event.column)).toEqual([0, 1])
  expect(buildTimeGrid({ range: sampleRange, events: [sampleEvent, overlap], adapter: nativeDateAdapter })).toEqual(positioned)
})

test('@claim:month-models', async () => {
  expect(buildMonth({ month: '2026-08-01T00:00:00Z', events: [sampleEvent], adapter: nativeDateAdapter }).weeks).toHaveLength(6)
  const window = getContinuousMonthWindow({ anchor: '2026-08-01T00:00:00Z', scrollTop: 600, monthHeight: 600, count: 24, overscan: 1, adapter: nativeDateAdapter })
  expect(window.length).toBeGreaterThan(1)
  expect(window.length).toBeLessThanOrEqual(5)
})

test('@claim:four-demo-views', async ({ page }) => {
  await page.goto('/demo')
  await expect(page.getByRole('region', { name: /Resource schedule/ })).toBeVisible()
  await page.getByRole('button', { name: 'Show day view' }).click()
  await expect(page.getByRole('grid', { name: 'day calendar' })).toBeVisible()
  await page.getByRole('button', { name: 'Show week view' }).click()
  await expect(page.getByRole('grid', { name: 'week calendar' })).toBeVisible()
  await page.getByRole('button', { name: 'Show month view' }).click()
  await expect(page.getByLabel('Continuous month calendar')).toBeVisible()
  await page.getByRole('button', { name: 'Show timeline view' }).click()
  await expect(page.getByRole('region', { name: /Resource schedule/ })).toBeVisible()
})

test('@claim:shared-demo-state', async ({ page }) => {
  await page.goto('/demo')
  const editor = page.getByLabel('Sample event JSON')
  await editor.fill((await editor.inputValue()).replace('Morning briefing', 'Shared state review'))
  await page.getByRole('button', { name: 'Apply sample event' }).click()
  await page.getByRole('button', { name: 'Show day view' }).click()
  await expect(page.getByRole('button', { name: /Shared state review/ })).toBeVisible()
  await page.getByRole('button', { name: 'Show timeline view' }).click()
  await expect(page.getByRole('button', { name: /^Shared state review/ })).toBeVisible()
})

test('@claim:sample-seed', async ({ page }) => {
  await page.goto('/?demo=1')
  await expect(page.getByText('Studio A', { exact: true })).toBeVisible()
  await expect(page.getByText('Maya Chen', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Morning briefing/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Prototype review/ })).toBeVisible()
})

test('@claim:demo-isolation-reset', async ({ page, context }) => {
  await page.goto('/?demo=1')
  await expect(page).toHaveURL(/\?demo=1$/)
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible()
  const editor = page.getByLabel('Sample event JSON')
  await editor.fill((await editor.inputValue()).replace('Morning briefing', 'Customer planning'))
  await page.getByRole('button', { name: 'Apply sample event' }).click()
  await expect(page.getByRole('button', { name: /^Customer planning/ })).toBeVisible()
  await page.getByRole('button', { name: 'Reset demo' }).click()
  await expect(page.getByRole('button', { name: /^Morning briefing/ })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: /^Morning briefing/ })).toBeVisible()
  await editor.fill((await editor.inputValue()).replace('Morning briefing', 'Discard this edit'))
  await page.getByRole('button', { name: 'Apply sample event' }).click()
  await page.getByRole('link', { name: 'Start for real — install the package' }).click()
  await page.getByRole('link', { name: 'Demo' }).first().click()
  await expect(page.getByRole('button', { name: /^Morning briefing/ })).toBeVisible()
  expect(await context.cookies()).toEqual([])
  expect(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, indexed: (await indexedDB.databases()).length }))).toEqual({ local: 0, session: 0, indexed: 0 })
})

test('@claim:pointer-modes', async () => {
  const expected: Record<PointerMode, PointerPreview> = {
    create: { start: '2026-08-27T09:00:00.000Z', end: '2026-08-27T11:00:00.000Z', resourceId: 'room-a' },
    move: { start: '2026-08-27T09:30:00.000Z', end: '2026-08-27T11:00:00.000Z', resourceId: 'room-a' },
    'resize-start': { start: '2026-08-27T09:30:00.000Z', end: '2026-08-27T10:30:00.000Z', resourceId: 'room-a' },
    'resize-end': { start: '2026-08-27T09:00:00.000Z', end: '2026-08-27T11:00:00.000Z', resourceId: 'room-a' }
  }
  for (const mode of Object.keys(expected) as PointerMode[]) {
    let commit: PointerPreview | undefined
    const interaction = createPointerInteraction({ mode, event: sampleEvent, pixelsPerMinute: 2, snapMinutes: 15, onPreview() {}, onCommit(value) { commit = value } })
    interaction.onPointerDown({ button: 0, clientX: 100, pointerId: 3, currentTarget: null, preventDefault() {} } as unknown as PointerEvent)
    interaction.onPointerUp({ clientX: 160, pointerId: 3 } as PointerEvent)
    expect(commit).toEqual(expected[mode])
  }
})

test('@claim:pointer-capture-validation', async () => {
  let committed: PointerPreview | undefined
  let captured = 0
  const interaction = createPointerInteraction({ mode: 'move', event: sampleEvent, pixelsPerMinute: 2, snapMinutes: 15, onPreview() {}, onCommit(value) { committed = value } })
  interaction.onPointerDown({ button: 0, clientX: 20, pointerId: 7, currentTarget: { setPointerCapture(id: number) { captured = id } }, preventDefault() {} } as unknown as PointerEvent)
  interaction.onPointerUp({ clientX: 83, pointerId: 7 } as PointerEvent)
  expect(captured).toBe(7)
  expect(committed?.start).toBe('2026-08-27T09:30:00.000Z')
  for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    expect(() => createPointerInteraction({ mode: 'move', event: sampleEvent, pixelsPerMinute: value, snapMinutes: 15, onPreview() {}, onCommit() {} })).toThrow(RangeError)
    expect(() => createPointerInteraction({ mode: 'move', event: sampleEvent, pixelsPerMinute: 1, snapMinutes: value, onPreview() {}, onCommit() {} })).toThrow(RangeError)
  }
})

test('@claim:grid-keyboard-navigation', async () => {
  const cases: Array<[string, number]> = [['ArrowLeft', 9], ['ArrowRight', 11], ['ArrowUp', 3], ['ArrowDown', 17], ['Home', 7], ['End', 13], ['PageUp', 0], ['PageDown', 38]]
  for (const [key, result] of cases) expect(getGridNavigation({ key, index: 10, columns: 7, count: 42, pageSize: 28 })).toBe(result)
  const edges: Record<string, number[]> = {
    ArrowLeft: [0, 5, 34, 40], ArrowRight: [1, 7, 36, 41], ArrowUp: [0, 0, 28, 34], ArrowDown: [7, 13, 41, 41],
    Home: [0, 0, 35, 35], End: [6, 6, 41, 41], PageUp: [0, 0, 7, 13], PageDown: [28, 34, 41, 41]
  }
  for (const [key, expected] of Object.entries(edges)) {
    for (const [position, result] of [0, 6, 35, 41].entries()) expect(getGridNavigation({ key, index: result, columns: 7, count: 42, pageSize: 28 })).toBe(expected[position])
  }
  expect(getGridNavigation({ key: 'Escape', index: 10, columns: 7, count: 42 })).toBeNull()
})

test('@claim:keyboard-controls', async ({ page }) => {
  await page.goto('/demo')
  const event = page.getByRole('button', { name: /^Morning briefing/ })
  await event.focus()
  await event.press('ArrowRight')
  await expect(event).toHaveAccessibleName(/8:45 AM/)
  await page.keyboard.press('Tab')
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.scheduler-status [aria-live="polite"]')).toHaveText('Morning briefing resized to 10:30 AM.')
})

test('@claim:iso-event-boundary', async () => {
  expect(() => createScheduler({ events: [{ ...sampleEvent, start: 'August 27 2026 09:00' }] })).toThrow(/ISO date-time/)
  expect(() => createScheduler({ events: [{ ...sampleEvent, start: '2026-08-27T09:00:00' }] })).toThrow(/ISO date-time/)
  expect(createScheduler({ events: [{ ...sampleEvent, start: '2026-08-27T09:00:00+05:30', end: '2026-08-27T10:30:00+05:30' }] }).getState().events).toHaveLength(1)
})

test('@claim:timezone-boundaries', async () => {
  const spring = createScheduler({ timeZone: 'America/New_York', initialView: 'day', anchorDate: '2026-03-08T16:00:00Z' })
  const fall = createScheduler({ timeZone: 'America/New_York', initialView: 'day', anchorDate: '2026-11-01T16:00:00Z' })
  const kolkata = createScheduler({ timeZone: 'Asia/Kolkata', initialView: 'day', anchorDate: '2026-03-08T16:00:00Z' })
  expect(spring.getState().visibleRange).toEqual({ start: '2026-03-08T05:00:00.000Z', end: '2026-03-09T04:00:00.000Z' })
  expect(fall.getState().visibleRange).toEqual({ start: '2026-11-01T04:00:00.000Z', end: '2026-11-02T05:00:00.000Z' })
  expect(kolkata.getState().visibleRange).toEqual({ start: '2026-03-07T18:30:00.000Z', end: '2026-03-08T18:30:00.000Z' })
})

test('@claim:date-adapters', async () => {
  const temporal = createTemporalAdapter(Temporal, 'America/New_York')
  const start = temporal.startOfDay(temporal.parse('2026-03-08T16:00:00Z'), 'America/New_York')
  expect(temporal.toISO(temporal.addDays(start, 1))).toBe('2026-03-09T04:00:00.000Z')
  const dateFns = createDateFnsAdapter({
    addMinutes: (date, amount) => new Date(date.getTime() + amount * 60_000),
    addDays: (date, amount) => new Date(date.getTime() + amount * 86_400_000),
    addMonths: (date, amount) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, date.getUTCDate())),
    startOfDay: date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())),
    startOfWeek: date => date,
    startOfMonth: date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
    format: () => 'fixture'
  })
  expect(dateFns.addMinutes(new Date('2026-08-27T09:00:00Z'), 15).toISOString()).toBe('2026-08-27T09:15:00.000Z')
  expect(nativeDateAdapter.addMinutes(new Date('2026-08-27T09:00:00Z'), 15).toISOString()).toBe('2026-08-27T09:15:00.000Z')
})

test('@claim:recurrence-scope', async () => {
  const recurring = { ...sampleEvent, recurrenceRule: 'FREQ=DAILY' }
  const scheduler = createScheduler({ events: [recurring] })
  expect(scheduler.getState().events).toHaveLength(1)
  expect(scheduler.getState().events[0]).toMatchObject({ id: 'kickoff', recurrenceRule: 'FREQ=DAILY' })
})

test('@claim:release-scope', async () => {
  const built = await import(`${pathToFileURL(resolve('dist/package/index.js')).href}?claim=scope`)
  const publicNames = Object.keys(built).map(name => name.toLowerCase())
  for (const excluded of ['account', 'payment', 'storage', 'ical', 'print', 'vue', 'svelte']) {
    expect(publicNames.some(name => name.includes(excluded))).toBeFalsy()
  }
  expect(Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).exports)).toEqual(['.', './react', './preset.css'])
})

test('@claim:browser-primitives', async ({ page }) => {
  expect(readFileSync('vite.config.ts', 'utf8')).toContain("target: 'es2022'")
  await page.goto('/?demo=1')
  expect(await page.evaluate(() => typeof PointerEvent === 'function')).toBeTruthy()
})

test('@claim:preset-css', async ({ request, page }) => {
  const consumer = await installHostedPackage(request)
  try {
    const css = readFileSync(join(consumer, 'node_modules/headless-scheduler/dist/package/preset.css'), 'utf8')
    expect(css).toContain('@layer components')
    expect(css).toContain('.hs-event')
    await page.setContent(`<style>${css}</style><style>:root{--hs-accent:rgb(1, 2, 3)}</style><button class="hs-event">Event</button>`)
    await expect(page.locator('.hs-event')).toHaveCSS('background-color', 'rgb(1, 2, 3)')
  } finally { rmSync(consumer, { recursive: true, force: true }) }
})

test('@claim:react-adapter', async ({ request }) => {
  for (const version of ['18.3.1', '19.1.0']) {
    const consumer = await installHostedPackage(request, [`react@${version}`, `react-dom@${version}`])
    try {
      execFileSync(process.execPath, ['--input-type=module', '--eval', "import React from 'react'; import { renderToString } from 'react-dom/server'; import { HeadlessScheduler, useScheduler } from 'headless-scheduler/react'; const html=renderToString(React.createElement(HeadlessScheduler,{options:{}},({state})=>React.createElement('span',null,state.view))); if(html!=='<span>week</span>'||typeof useScheduler!=='function')process.exit(1)"], { cwd: consumer })
    } finally { rmSync(consumer, { recursive: true, force: true }) }
  }
})

test('@claim:privacy-boundary', async ({ page, context }) => {
  const origins = new Set<string>()
  page.on('request', request => origins.add(new URL(request.url()).origin))
  await page.goto('/?demo=1')
  await page.getByRole('button', { name: 'Show month view' }).click()
  await page.getByRole('button', { name: 'Show timeline view' }).click()
  await page.getByRole('button', { name: 'Reset demo' }).click()
  expect([...origins]).toEqual([new URL(page.url()).origin])
  expect(await context.cookies()).toEqual([])
  expect(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, indexed: (await indexedDB.databases()).length }))).toEqual({ local: 0, session: 0, indexed: 0 })
})

test('@claim:package-side-effects', async ({ request, page }) => {
  const consumer = await installHostedPackage(request)
  try {
    const packageDir = join(consumer, 'node_modules/headless-scheduler/dist/package')
    await page.route('**/claim-package/**', route => {
      const file = route.request().url().split('/claim-package/')[1]
      if (!file || file.includes('..')) return route.abort()
      return route.fulfill({ body: readFileSync(join(packageDir, file)), contentType: 'text/javascript' })
    })
    await page.goto('/')
    const result = await page.evaluate(async () => {
      const calls: string[] = []
      const unexpected = (name: string) => (..._args: unknown[]) => { calls.push(name); throw new Error(`Unexpected ${name}`) }
      const replace = (target: object, key: string, value: unknown) => Object.defineProperty(target, key, { configurable: true, writable: true, value })
      replace(globalThis, 'fetch', unexpected('fetch'))
      replace(globalThis, 'XMLHttpRequest', new Proxy(function () {}, { construct() { calls.push('XMLHttpRequest'); throw new Error('Unexpected XMLHttpRequest') } }))
      replace(globalThis, 'WebSocket', new Proxy(function () {}, { construct() { calls.push('WebSocket'); throw new Error('Unexpected WebSocket') } }))
      replace(globalThis, 'EventSource', new Proxy(function () {}, { construct() { calls.push('EventSource'); throw new Error('Unexpected EventSource') } }))
      replace(navigator, 'sendBeacon', unexpected('sendBeacon'))
      replace(globalThis, 'localStorage', new Proxy({}, { get() { calls.push('localStorage'); throw new Error('Unexpected localStorage') } }))
      replace(globalThis, 'sessionStorage', new Proxy({}, { get() { calls.push('sessionStorage'); throw new Error('Unexpected sessionStorage') } }))
      replace(globalThis, 'indexedDB', new Proxy({}, { get() { calls.push('indexedDB'); throw new Error('Unexpected indexedDB') } }))
      replace(globalThis, 'caches', new Proxy({}, { get() { calls.push('Cache Storage'); throw new Error('Unexpected Cache Storage') } }))
      Object.defineProperty(Document.prototype, 'cookie', { configurable: true, get() { calls.push('cookie-read'); return '' }, set() { calls.push('cookie-write') } })
      const moduleUrl: string = '/claim-package/index.js'
      const built = await import(moduleUrl)
      const event = { id: 'kickoff', title: 'Kickoff', resourceId: 'room-a', start: '2026-08-27T09:00:00Z', end: '2026-08-27T10:30:00Z' }
      const scheduler = built.createScheduler({ events: [event], resources: [{ id: 'room-a', title: 'Room A' }], visibleRange: { start: '2026-08-27T08:00:00Z', end: '2026-08-27T18:00:00Z' } })
      const unsubscribe = scheduler.subscribe(() => undefined)
      scheduler.setView('day'); scheduler.setAnchorDate('2026-08-27T09:00:00Z'); scheduler.setVisibleRange({ start: '2026-08-27T08:00:00Z', end: '2026-08-27T18:00:00Z' }); scheduler.setResources([{ id: 'room-a', title: 'Room A' }]); scheduler.setEvents([event])
      scheduler.createEvent({ ...event, id: 'second' }); scheduler.updateEvent('second', { title: 'Updated' }); scheduler.moveEvent('second', { start: '2026-08-27T10:00:00Z' }); scheduler.resizeEvent('second', { end: '2026-08-27T12:00:00Z' }); scheduler.removeEvent('second'); scheduler.navigate(1); scheduler.announce('updated'); unsubscribe()
      built.buildMonth({ month: '2026-08-01T00:00:00Z', events: scheduler.getState().events, adapter: built.nativeDateAdapter }); built.getContinuousMonthWindow({ anchor: '2026-08-01T00:00:00Z', scrollTop: 0, monthHeight: 600, count: 12, adapter: built.nativeDateAdapter }); built.buildTimeGrid({ range: scheduler.getState().visibleRange, events: scheduler.getState().events, adapter: built.nativeDateAdapter }); built.buildResourceTimeline({ range: scheduler.getState().visibleRange, events: scheduler.getState().events, resources: scheduler.getState().resources, adapter: built.nativeDateAdapter }); built.layoutOverlaps(scheduler.getState().events, scheduler.getState().visibleRange, built.nativeDateAdapter)
      const interaction = built.createPointerInteraction({ mode: 'move', event, pixelsPerMinute: 2, onPreview() {}, onCommit() {} }); interaction.onPointerDown({ button: 0, clientX: 0, pointerId: 1, currentTarget: null, preventDefault() {} }); interaction.onPointerUp({ clientX: 30, pointerId: 1 })
      built.getGridNavigation({ key: 'ArrowRight', index: 0, columns: 7, count: 42 })
      return calls
    })
    expect(result).toEqual([])
  } finally { await page.unroute('**/claim-package/**'); rmSync(consumer, { recursive: true, force: true }) }
})

test('@claim:headless-core', async () => {
  expect(typeof (globalThis as Record<string, unknown>).document).toBe('undefined')
  const built = await import(`${pathToFileURL(resolve('dist/package/index.js')).href}?claim=headless-core`)
  const scheduler = built.createScheduler({ events: [sampleEvent], resources: [{ id: 'room-a', title: 'Room A' }], visibleRange: sampleRange })
  const timeline = built.buildResourceTimeline({ range: sampleRange, events: scheduler.getState().events, resources: scheduler.getState().resources, adapter: built.nativeDateAdapter })
  expect(timeline.rows[0].events[0].title).toBe('Kickoff')
  expect(JSON.parse(JSON.stringify(timeline)).rows).toHaveLength(1)
})

test('@claim:offline-demo', async ({ page, context }) => {
  await page.goto('/?demo=1')
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null)
  const cached = await page.evaluate(async () => {
    const keys = await caches.keys()
    return (await Promise.all(keys.map(async key => (await caches.open(key)).keys()))).flat().map(request => new URL(request.url).pathname)
  })
  expect(cached).toContain('/demo')
  expect(cached).toContain('/offline.html')
  expect(cached.every(path => !path.startsWith('/api/'))).toBeTruthy()
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: 'Edit a resource timeline' })).toBeVisible()
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible()
  await expect(page.getByText('Studio A', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Morning briefing/ })).toBeVisible()
  await page.getByRole('button', { name: 'Show day view' }).click()
  await expect(page.getByRole('grid', { name: 'day calendar' })).toBeVisible()
  await page.getByRole('button', { name: 'Show timeline view' }).click()
  const editor = page.getByLabel('Sample event JSON')
  await editor.fill((await editor.inputValue()).replace('Morning briefing', 'Offline planning'))
  await page.getByRole('button', { name: 'Apply sample event' }).click()
  await expect(page.getByRole('button', { name: /^Offline planning/ })).toBeVisible()
})

test('@claim:route-contract', async ({ page, request }) => {
  const metadata = [['/', 'Headless Scheduler — calendar and timeline logic'], ['/demo', 'Demo — Headless Scheduler'], ['/privacy', 'Privacy — Headless Scheduler'], ['/terms', 'Terms — Headless Scheduler']] as const
  for (const [route, title] of metadata) {
    const response = await request.get(route)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain(`<title>${title}</title>`)
    expect(html).toContain(`rel="canonical" href="https://headless-scheduler.sociobot.in${route}"`)
    expect(html).toContain(`property="og:url" content="https://headless-scheduler.sociobot.in${route}"`)
    expect(html).toContain('property="og:image"')
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html).toContain('rel="apple-touch-icon"')
    await page.goto(route)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('header')).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(1)
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy')
    await expect(page).toHaveTitle(title)
    expect((await page.title()).length).toBeLessThanOrEqual(60)
  }
  const missing = await request.get('/missing-page')
  expect(missing.status()).toBe(404)
  expect(await missing.text()).toContain('<title>Page not found — Headless Scheduler</title>')
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  const primary = page.getByRole('link', { name: /Try it with sample data/ })
  await expect(primary).toHaveAttribute('href', '/?demo=1')
  await primary.click()
  await expect(page).toHaveURL(/\?demo=1$/)
  await expect(page.locator('h1')).toBeFocused()
  await expect(page.locator('.route-announcer')).toHaveText('Demo — Headless Scheduler')
  await page.goBack()
  await expect(page.locator('h1')).toBeFocused()
})

test('@claim:static-site-artifact', async ({ request }) => {
  for (const route of ['/', '/demo', '/privacy', '/terms', '/headless-scheduler-0.1.0.tgz']) expect((await request.get(route)).status()).toBe(200)
  for (const file of ['dist/site/index.html', 'dist/site/demo/index.html', 'dist/site/privacy/index.html', 'dist/site/terms/index.html', 'dist/site/404.html', 'dist/site/sw.js']) expect(existsSync(file)).toBeTruthy()
})

test('mobile controls, dialog focus, and validation meet the interaction baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const primaryBox = await page.getByRole('link', { name: /Try it with sample data/ }).boundingBox()
  const factsBox = await page.getByRole('list', { name: 'Package facts' }).boundingBox()
  expect(primaryBox && primaryBox.y + primaryBox.height).toBeLessThanOrEqual(844)
  expect(factsBox && factsBox.y + factsBox.height).toBeLessThanOrEqual(844)
  await page.goto('/?demo=1')
  const undersized = await page.locator('a:visible,button:visible,input:visible,select:visible,textarea:visible').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect()
    return { name: element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName, width: box.width, height: box.height }
  }).filter(box => box.width < 44 || box.height < 44))
  expect(undersized).toEqual([])
  const add = page.getByRole('button', { name: 'Add event' })
  await add.click()
  await expect(page.getByLabel('Event title')).toBeFocused()
  await page.getByRole('button', { name: 'Close dialog' }).click()
  await expect(add).toBeFocused()
  const editor = page.getByLabel('Sample event JSON')
  await editor.fill((await editor.inputValue()).replace('"studio"', '"unknown-room"'))
  await page.getByRole('button', { name: 'Apply sample event' }).click()
  await expect(page.getByRole('alert')).toHaveText('Use a resourceId shown in the sample schedule.')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy()
})
