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
  const exercise = async viewport => {
    const context = await browser.newContext({ viewport })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(String(error)))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    await page.goto(url, { waitUntil: 'networkidle' })

    if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) throw new Error(`Page overflows the ${viewport.width}px viewport`)
    await page.getByRole('button', { name: 'Add event' }).click()
    await page.waitForFunction(() => {
      const dialog = document.querySelector('dialog[open]')
      const title = dialog?.querySelector('input[name="title"]')
      return title !== null && document.activeElement === title
    })
    await page.getByLabel('Event title').fill(`Customer call ${viewport.width}`)
    await page.getByRole('button', { name: 'Add event', exact: true }).last().click()
    await page.getByRole('button', { name: new RegExp(`Customer call ${viewport.width}`) }).waitFor()

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
    const resizeHandle = morning.locator('.resize-handle')
    await resizeHandle.scrollIntoViewIfNeeded()
    const handleBox = await resizeHandle.boundingBox()
    if (!handleBox) throw new Error('Resize handle is not visible')
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(handleBox.x + handleBox.width / 2 + 30, handleBox.y + handleBox.height / 2)
    await page.mouse.up()
    const status = page.locator('.scheduler-status [aria-live="polite"]')
    await status.waitFor({ state: 'visible' })
    if (!/Morning briefing resized to (?:10:15|10:30|10:45) AM\./.test(await status.innerText())) {
      throw new Error(`Resize completion did not announce its new end time: ${await status.innerText()}`)
    }
    if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`)
    await context.close()
    return `${viewport.width}x${viewport.height}`
  }
  const viewports = await Promise.all([exercise({ width: 390, height: 844 }), exercise({ width: 1440, height: 900 })])
  console.log(JSON.stringify({ viewports, addEvent: true, keyboardMove: true, monthNavigation: true, resizeAnnouncement: true, consoleErrors: 0 }))
} finally {
  await browser.close()
  await server?.close()
}
