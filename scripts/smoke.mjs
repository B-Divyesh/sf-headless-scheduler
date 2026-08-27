import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('/usr/lib/node_modules/playwright')
const url = process.argv[2] ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('pageerror', error => errors.push(String(error)))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
await page.goto(url, { waitUntil: 'networkidle' })

if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error('Page overflows the 390px viewport')
await page.getByRole('button', { name: 'Add event' }).click()
if (await page.evaluate(() => document.activeElement?.getAttribute('name')) !== 'title') throw new Error('Dialog did not move focus to title')
await page.getByLabel('Event title').fill('Customer call')
await page.getByRole('button', { name: 'Add event', exact: true }).last().click()
await page.getByRole('button', { name: /Customer call/ }).waitFor()

const morning = page.getByRole('button', { name: /Morning briefing/ })
await morning.focus()
await morning.press('ArrowRight')
if (!(await morning.getAttribute('aria-label'))?.includes('8:45 AM')) throw new Error('Keyboard move did not update the event')

await page.getByRole('button', { name: 'Month' }).click()
await page.getByRole('heading', { name: 'August 2026' }).waitFor()
const currentCell = page.locator('[role="gridcell"][tabindex="0"]').first()
await currentCell.focus()
await currentCell.press('ArrowRight')
if (await page.evaluate(() => document.activeElement?.getAttribute('data-day')) !== '1') throw new Error('Month grid arrow navigation failed')

await page.getByRole('button', { name: 'Timeline' }).click()
await page.getByRole('region', { name: 'Resource schedule for 27 August 2026' }).waitFor()
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`)
console.log(JSON.stringify({ viewport: '390x844', addEvent: true, keyboardMove: true, monthNavigation: true, consoleErrors: 0 }))
await browser.close()
