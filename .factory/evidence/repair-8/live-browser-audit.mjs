import { chromium } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

const base = 'https://headless-scheduler.sociobot.in'
const browser = await chromium.launch()
const results = []

try {
  for (const viewport of [
    { name: 'phone', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 }
  ]) {
    const context = await browser.newContext({ viewport, serviceWorkers: 'allow' })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(String(error)))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    const response = await page.goto(`${base}/?cold=repair-8-${viewport.name}-${Date.now()}`, { waitUntil: 'networkidle' })
    const heading = await page.getByRole('heading', { level: 1 }).innerText()
    const audience = await page.locator('.lede').innerText()
    const action = page.getByRole('link', { name: /Try it with sample data/ })
    const firstAction = (await action.innerText()).trim()
    const actionBox = await action.boundingBox()
    const factsBox = await page.getByRole('list', { name: 'Package facts' }).boundingBox()
    if (response?.status() !== 200 || heading !== 'Build calendar and resource timeline UIs') throw new Error(`${viewport.name}: job is unclear`)
    if (audience !== 'For product engineers who need scheduling behavior without adopting another component library.') throw new Error(`${viewport.name}: audience is unclear`)
    if (!actionBox || actionBox.y + actionBox.height > viewport.height || !factsBox || factsBox.y + factsBox.height > viewport.height) throw new Error(`${viewport.name}: first action or facts require scrolling`)

    await action.click()
    if (!new URL(page.url()).searchParams.has('demo')) throw new Error(`${viewport.name}: first action did not enter the demo`)
    const banner = page.getByText('Demo — sample data, nothing is saved')
    await banner.waitFor()
    await page.getByText('Studio A', { exact: true }).waitFor()
    await page.getByRole('button', { name: /^Morning briefing/ }).waitFor()

    await page.getByRole('button', { name: 'Add event', exact: true }).first().click()
    await page.getByRole('button', { name: 'Add event', exact: true }).last().click()
    await page.getByRole('alert').waitFor()
    if (await page.getByRole('alert').innerText() !== 'Add a title so people know what is scheduled.') throw new Error(`${viewport.name}: blank-title error is not actionable`)
    await page.getByLabel('Event title').fill(`Boundary event ${viewport.name}`)
    await page.getByLabel('Start time').fill('23:59')
    await page.getByRole('button', { name: 'Add event', exact: true }).last().click()
    await page.getByText(`Boundary event ${viewport.name} added.`).waitFor()
    await banner.waitFor()

    const editor = page.getByLabel('Sample event JSON')
    const edit = `Repair 8 ${viewport.name} edit`
    await editor.fill((await editor.inputValue()).replace('Morning briefing', edit))
    await page.getByRole('button', { name: 'Apply sample event' }).click()
    await page.getByRole('button', { name: new RegExp(`^${edit}`) }).waitFor()
    await banner.waitFor()
    await page.getByRole('button', { name: 'Reset demo' }).click()
    await page.getByRole('button', { name: /^Morning briefing/ }).waitFor()
    if (await page.getByText(edit, { exact: false }).count()) throw new Error(`${viewport.name}: reset retained the edit`)
    const storage = await page.evaluate(async () => ({
      cookies: document.cookie,
      localStorage: localStorage.length,
      sessionStorage: sessionStorage.length,
      indexedDB: (await indexedDB.databases()).length
    }))
    if (storage.cookies || storage.localStorage || storage.sessionStorage || storage.indexedDB) throw new Error(`${viewport.name}: demo wrote user data`)
    await page.screenshot({ path: `.factory/evidence/repair-8/demo-${viewport.name}.png`, fullPage: true })
    results.push({ viewport, status: response.status(), heading, audience, firstAction, sample: ['Studio A', 'Morning briefing'], banner: await banner.innerText(), invalidRecovery: true, boundaryTime: '23:59', reset: true, storage, errors })
    if (errors.length) throw new Error(`${viewport.name}: browser errors: ${errors.join('; ')}`)
    await context.close()
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  const response = await page.goto(`${base}/missing-repair-8`, { waitUntil: 'networkidle' })
  const notFound = { status: response?.status(), heading: await page.getByRole('heading', { level: 1 }).innerText(), label: await page.getByText('Page not found', { exact: true }).innerText() }
  if (notFound.status !== 404 || notFound.heading !== 'This page does not exist') throw new Error('The not-found route is incomplete')
  await context.close()
  await writeFile('.factory/evidence/repair-8/live-browser.json', `${JSON.stringify({ base, results, notFound }, null, 2)}\n`)
  console.log(JSON.stringify({ viewports: results.map(result => result.viewport.name), oneClickDemo: true, invalidRecovery: true, boundaryTime: '23:59', reset: true, persistentUserData: false, browserErrors: 0, notFound }))
} finally {
  await browser.close()
}
