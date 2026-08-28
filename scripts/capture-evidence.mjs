import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { startStaticSite } from './site-server.mjs'

const externalUrl = process.argv[2]
const output = resolve(process.argv[3] ?? '.factory/evidence/polish-1')
const server = externalUrl ? null : await startStaticSite(resolve('dist/site'))
const base = (externalUrl ?? server.url).replace(/\/$/, '')
await mkdir(output, { recursive: true })
const browser = await chromium.launch()
const report = { base, routes: [], firstScreen: {}, demoPrivacy: {}, screenshots: [] }

try {
  for (const viewport of [{ name: 'mobile', width: 390, height: 844 }, { name: 'desktop', width: 1440, height: 900 }]) {
    for (const route of [{ name: 'home', path: '/' }, { name: 'demo', path: '/?demo=1' }]) {
      const context = await browser.newContext({ viewport })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(String(error)))
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
      const response = await page.goto(`${base}${route.path}`, { waitUntil: 'networkidle' })
      const screenshot = `${route.name}-${viewport.name}.png`
      await page.screenshot({ path: resolve(output, screenshot), fullPage: true })
      report.screenshots.push(screenshot)
      report.routes.push({ route: route.path, viewport: `${viewport.width}x${viewport.height}`, status: response?.status(), title: await page.title(), h1: await page.locator('h1').count(), errors, overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth) })
      if (route.name === 'home') {
        const action = await page.getByRole('link', { name: /Try it with sample data/ }).boundingBox()
        const facts = await page.getByRole('list', { name: 'Package facts' }).boundingBox()
        report.firstScreen[viewport.name] = { actionVisible: !!action && action.y + action.height <= viewport.height, factsVisible: !!facts && facts.y + facts.height <= viewport.height }
      }
      await context.close()
    }
  }

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  const origins = new Set()
  page.on('request', request => origins.add(new URL(request.url()).origin))
  await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' })
  const targets = await page.locator('a:visible,button:visible,input:visible,select:visible,textarea:visible').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect()
    return { name: element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName, width: box.width, height: box.height }
  }).filter(box => box.width < 44 || box.height < 44))
  report.demoPrivacy = {
    origins: [...origins],
    cookies: (await context.cookies()).length,
    storage: await page.evaluate(async () => ({ localStorage: localStorage.length, sessionStorage: sessionStorage.length, indexedDB: (await indexedDB.databases()).length })),
    undersizedTargets: targets
  }
  await context.close()

  for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-polish-1']) {
    const response = await fetch(`${base}${route}`)
    const html = await response.text()
    report.routes.push({ route, viewport: 'raw-http', status: response.status, title: html.match(/<title>([^<]+)/)?.[1] ?? null, canonical: html.match(/rel="canonical" href="([^"]+)/)?.[1] ?? null })
  }
  await writeFile(resolve(output, 'browser.json'), JSON.stringify(report, null, 2))
  if (report.routes.some(item => item.errors?.length || item.overflow || (item.route === '/missing-polish-1' ? item.status !== 404 : item.status !== 200))) throw new Error('Browser evidence contains a failed route')
  if (Object.values(report.firstScreen).some(item => !item.actionVisible || !item.factsVisible)) throw new Error('First-screen content is below the viewport')
  if (targets.length) throw new Error(`Undersized targets: ${JSON.stringify(targets)}`)
  console.log(JSON.stringify(report))
} finally {
  await browser.close()
  await server?.close()
}
