import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { startStaticSite } from './site-server.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require('/usr/lib/node_modules/playwright')
const server = await startStaticSite(resolve('dist/site'))
const browser = await chromium.launch()
try {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(server.url, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null)
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  if (await page.getByRole('heading', { level: 1 }).count() !== 1) throw new Error('Offline reload did not render the cached shell')
  console.log(JSON.stringify({ offlineReload: true, serviceWorkerControlled: true }))
  await context.close()
} finally {
  await browser.close()
  await server.close()
}
