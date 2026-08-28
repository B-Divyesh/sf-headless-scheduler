import { expect, test } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { buildMonth, buildResourceTimeline, createScheduler, getContinuousMonthWindow, nativeDateAdapter } from '../src'

const sampleEvent = { id: 'kickoff', title: 'Kickoff', resourceId: 'room-a', start: '2026-08-27T09:00:00Z', end: '2026-08-27T10:30:00Z' }

test('@claim:release-package-installs', async ({ request }) => {
  const response = await request.get('/headless-scheduler-0.1.0.tgz')
  expect(response.ok()).toBeTruthy()
  const consumer = mkdtempSync(join(tmpdir(), 'hs-claim-'))
  try {
    execFileSync('npm', ['init', '-y'], { cwd: consumer, stdio: 'ignore' })
    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', resolve('dist/site/headless-scheduler-0.1.0.tgz')], { cwd: consumer, stdio: 'ignore' })
    execFileSync(process.execPath, ['--input-type=module', '--eval', "import { createScheduler } from 'headless-scheduler'; if (createScheduler().getState().view !== 'week') process.exit(1)"], { cwd: consumer })
    execFileSync(process.execPath, ['--eval', "if (typeof require('headless-scheduler').createScheduler !== 'function') process.exit(1)"], { cwd: consumer })
    for (const file of ['index.d.ts', 'react.js', 'react.cjs', 'react.d.ts', 'preset.css']) expect(readFileSync(join(consumer, 'node_modules/headless-scheduler/dist/package', file)).length).toBeGreaterThan(0)
  } finally { rmSync(consumer, { recursive: true, force: true }) }
})

test('@claim:mit-zero-dependencies', async () => {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
  expect(manifest.license).toBe('MIT')
  expect(manifest.dependencies).toBeUndefined()
  expect(readFileSync('LICENSE', 'utf8')).toContain('MIT License')
})

test('@claim:readme-example', async () => {
  const scheduler = createScheduler({ dateAdapter: nativeDateAdapter, initialView: 'resource-timeline', visibleRange: { start: '2026-08-27T08:00:00Z', end: '2026-08-27T18:00:00Z' }, resources: [{ id: 'room-a', title: 'Room A' }, { id: 'room-b', title: 'Room B' }], events: [sampleEvent] })
  scheduler.moveEvent('kickoff', { resourceId: 'room-b', start: '2026-08-27T11:00:00Z' })
  expect(scheduler.getState().events[0]).toMatchObject({ resourceId: 'room-b', start: '2026-08-27T11:00:00.000Z', end: '2026-08-27T12:30:00.000Z' })
})

test('@claim:view-models', async () => {
  const range = { start: '2026-08-27T08:00:00Z', end: '2026-08-27T18:00:00Z' }
  const timeline = buildResourceTimeline({ range, events: [sampleEvent], resources: [{ id: 'room-a', title: 'Room A' }], adapter: nativeDateAdapter, slotMinutes: 60 })
  expect(timeline.rows[0]?.events[0]).toMatchObject({ left: 10, width: 15 })
  expect(buildMonth({ month: '2026-08-01T00:00:00Z', events: [sampleEvent], adapter: nativeDateAdapter }).weeks).toHaveLength(6)
  expect(getContinuousMonthWindow({ anchor: '2026-08-01T00:00:00Z', scrollTop: 0, monthHeight: 600, adapter: nativeDateAdapter }).length).toBeLessThanOrEqual(8)
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

test('@claim:demo-isolation-reset', async ({ page, context }) => {
  await page.goto('/?demo=1')
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
  await page.getByRole('link', { name: 'Start for real' }).click()
  await page.getByRole('link', { name: 'Demo' }).first().click()
  await expect(page.getByRole('button', { name: /^Morning briefing/ })).toBeVisible()
  expect(await context.cookies()).toEqual([])
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
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

test('@claim:privacy-boundary', async ({ page, context }) => {
  const origins = new Set<string>()
  page.on('request', request => origins.add(new URL(request.url()).origin))
  await page.goto('/demo')
  await page.getByRole('button', { name: 'Show month view' }).click()
  await page.getByRole('button', { name: 'Show timeline view' }).click()
  expect([...origins]).toEqual(['http://127.0.0.1:4173'])
  expect(await context.cookies()).toEqual([])
  expect(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, indexed: (await indexedDB.databases()).length }))).toEqual({ local: 0, session: 0, indexed: 0 })
})

test('@claim:offline-demo', async ({ page, context }) => {
  await page.goto('/demo')
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null)
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { level: 1, name: 'Edit a resource timeline' })).toBeVisible()
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible()
})

test('@claim:route-contract', async ({ page, request }) => {
  expect((await request.get('/missing-page')).status()).toBe(404)
  for (const route of ['/demo', '/privacy', '/terms']) {
    await page.goto(route)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('header')).toHaveCount(1)
    await expect(page.locator('footer')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://headless-scheduler.sociobot.in${route}`)
  }
  await page.goto('/')
  await page.getByRole('link', { name: /Try it with sample data/ }).click()
  await expect(page.locator('h1')).toBeFocused()
  await page.goBack()
  await expect(page.locator('h1')).toBeFocused()
})
