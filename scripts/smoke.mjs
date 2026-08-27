import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { startStaticSite } from './site-server.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require('/usr/lib/node_modules/playwright')
const externalUrl = process.argv[2]
const server = externalUrl ? null : await startStaticSite(resolve('dist/site'))
const url = externalUrl ?? server.url
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', error => errors.push(String(error)))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(url, { waitUntil: 'networkidle' })

  if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error('Page overflows the 390px viewport')
  await page.getByRole('button', { name: 'Add event' }).click()
  await page.waitForFunction(() => {
    const dialog = document.querySelector('dialog[open]')
    const title = dialog?.querySelector('input[name="title"]')
    return title !== null && document.activeElement === title
  })
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
} finally {
  await browser.close()
  await server?.close()
}
