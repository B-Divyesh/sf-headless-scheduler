import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'

const require = createRequire(import.meta.url)
const { chromium } = require('/usr/lib/node_modules/playwright')

const base = 'https://headless-scheduler.sociobot.in'
const output = '.factory/evidence/verification-8'
const browser = await chromium.launch()
const viewportResults = []

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

try {
  for (const viewport of [
    { name: 'phone', width: 390, height: 844 },
    { name: 'desktop', width: 1440, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport, serviceWorkers: 'allow' })
    const page = await context.newPage()
    const errors = []
    const origins = new Set()
    page.on('pageerror', error => errors.push(String(error)))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    page.on('request', request => origins.add(new URL(request.url()).origin))

    const response = await page.goto(`${base}/?verify=8-${viewport.name}-${Date.now()}`, { waitUntil: 'networkidle' })
    const heading = await page.getByRole('heading', { level: 1 }).innerText()
    const audience = await page.locator('.lede').innerText()
    const action = page.getByRole('link', { name: 'Try it with sample data' })
    const actionBox = await action.boundingBox()
    const factsBox = await page.getByRole('list', { name: 'Package facts' }).boundingBox()
    assert(response?.status() === 200, `${viewport.name}: home did not return 200`)
    assert(heading === 'Build calendar and resource timeline UIs', `${viewport.name}: job heading changed`)
    assert(audience === 'For product engineers who need scheduling behavior without adopting another component library.', `${viewport.name}: audience changed`)
    assert(actionBox && actionBox.y + actionBox.height <= viewport.height, `${viewport.name}: first action needs scrolling`)
    assert(factsBox && factsBox.y + factsBox.height <= viewport.height, `${viewport.name}: facts need scrolling`)
    assert(await page.evaluate(() => scrollY) === 0, `${viewport.name}: cold page did not start at the top`)
    await page.screenshot({ path: `${output}/cold-${viewport.name}.png` })

    await action.click()
    assert(new URL(page.url()).searchParams.get('demo') === '1', `${viewport.name}: sample action did not enter demo mode`)
    assert(await page.title() === 'Demo — Headless Scheduler', `${viewport.name}: demo title is wrong`)
    const banner = page.getByText('Demo — sample data, nothing is saved')
    await banner.waitFor()
    await page.getByText('Studio A', { exact: true }).waitFor()
    await page.getByText('Maya Chen', { exact: true }).waitFor()
    await page.getByRole('button', { name: /^Morning briefing/ }).waitFor()
    await page.getByRole('button', { name: /^Prototype review/ }).waitFor()

    const openAdd = page.locator('.add-button')
    await openAdd.click()
    const dialog = page.getByRole('dialog', { name: 'Add an event' })
    await dialog.waitFor()
    assert(await page.getByLabel('Event title').evaluate(element => element === document.activeElement), `${viewport.name}: dialog did not focus its title field`)
    await dialog.locator('button[type="submit"]').click()
    const titleError = page.getByRole('alert')
    await titleError.waitFor()
    assert(await titleError.innerText() === 'Add a title so people know what is scheduled.', `${viewport.name}: blank-title error is unclear`)
    assert(await page.getByLabel('Event title').getAttribute('aria-describedby') === 'form-error', `${viewport.name}: blank-title error is not bound to its field`)
    await page.getByLabel('Event title').fill(`Boundary 23:59 ${viewport.name}`)
    await page.getByLabel('Start time').fill('23:59')
    await dialog.locator('button[type="submit"]').click()
    await page.getByText(`Boundary 23:59 ${viewport.name} added.`).waitFor()
    await banner.waitFor()

    const editor = page.getByLabel('Sample event JSON')
    const original = await editor.inputValue()
    await editor.fill('{')
    await page.getByRole('button', { name: 'Apply sample event' }).click()
    const jsonError = page.locator('#sample-error')
    await jsonError.waitFor()
    assert((await editor.getAttribute('aria-describedby')) === 'sample-error', `${viewport.name}: JSON error is not bound to the editor`)
    const uniqueEdit = `Verification 8 ${viewport.name} edit`
    await editor.fill(original.replace('Morning briefing', uniqueEdit))
    await page.getByRole('button', { name: 'Apply sample event' }).click()
    const editedEvent = page.getByRole('button', { name: new RegExp(`^${uniqueEdit}`) })
    await editedEvent.waitFor()
    await banner.waitFor()

    await editedEvent.focus()
    await editedEvent.press('ArrowRight')
    assert((await editedEvent.getAttribute('aria-label'))?.includes('8:45 AM'), `${viewport.name}: keyboard move did not use a 15-minute step`)
    await page.keyboard.press('Tab')
    const resize = page.getByRole('button', { name: new RegExp(`^Resize ${uniqueEdit}`) })
    assert(await resize.evaluate(element => element === document.activeElement), `${viewport.name}: resize control is not next in keyboard order`)
    const resizeBox = await resize.boundingBox()
    assert(resizeBox && resizeBox.width >= 44 && resizeBox.height >= 44, `${viewport.name}: resize target is under 44px`)
    await page.keyboard.press('ArrowRight')
    assert((await resize.getAttribute('aria-label'))?.includes('10:30 AM'), `${viewport.name}: keyboard resize did not change the end time`)
    await page.getByText(`${uniqueEdit} resized to 10:30 AM.`).waitFor()

    await editedEvent.focus()
    await editedEvent.press('Delete')
    await page.getByText(`${uniqueEdit} removed. Undo is available.`).waitFor()
    await page.getByRole('button', { name: 'Undo remove' }).click()
    await page.getByText(`${uniqueEdit} restored.`).waitFor()
    await page.getByRole('button', { name: new RegExp(`^${uniqueEdit}`) }).waitFor()

    await page.getByRole('button', { name: 'Reset demo' }).click()
    await page.getByText('Demo reset to the original five events.').waitFor()
    await page.getByRole('button', { name: /^Morning briefing/ }).waitFor()
    assert(await page.getByText(uniqueEdit, { exact: false }).count() === 0, `${viewport.name}: reset kept the edit`)
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('button', { name: /^Morning briefing/ }).waitFor()
    await page.screenshot({ path: `${output}/demo-${viewport.name}.png`, fullPage: true })

    const storage = await page.evaluate(async () => {
      const cacheNames = await caches.keys()
      const cacheEntries = (await Promise.all(cacheNames.map(async name => {
        const cache = await caches.open(name)
        return Promise.all((await cache.keys()).map(async request => ({
          url: request.url,
          method: request.method,
          containsEdit: (await (await cache.match(request)).clone().text()).includes('Verification 8'),
        })))
      }))).flat()
      return {
        cookies: document.cookie,
        localStorage: localStorage.length,
        sessionStorage: sessionStorage.length,
        indexedDB: (await indexedDB.databases()).length,
        cacheNames,
        cacheEntries,
      }
    })
    assert(!storage.cookies && storage.localStorage === 0 && storage.sessionStorage === 0 && storage.indexedDB === 0, `${viewport.name}: demo persisted user data`)
    assert(storage.cacheNames.length === 1 && storage.cacheEntries.length === 20, `${viewport.name}: static cache differs from the disclosed shell`)
    assert(storage.cacheEntries.every(entry => entry.method === 'GET' && !entry.containsEdit && new URL(entry.url).origin === base), `${viewport.name}: cache contains user data or a foreign request`)
    assert([...origins].every(origin => origin === base), `${viewport.name}: page contacted another origin`)
    assert(errors.length === 0, `${viewport.name}: browser errors: ${errors.join('; ')}`)

    viewportResults.push({
      viewport,
      heading,
      audience,
      action: 'Try it with sample data',
      factsBeforeScroll: true,
      sample: ['Studio A', 'Maya Chen', 'Morning briefing', 'Prototype review'],
      persistentBanner: await banner.innerText(),
      invalidTitleRecovery: true,
      invalidJsonRecovery: true,
      boundaryTime: '23:59',
      keyboardMoveResize: true,
      deleteUndo: true,
      resetReload: true,
      storage,
      requestOrigins: [...origins],
      errors,
    })
    await context.close()
  }

  const routeContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const routePage = await routeContext.newPage()
  const routes = []
  const allHrefs = new Set()
  for (const item of [
    { path: '/', status: 200, title: 'Headless Scheduler — calendar and timeline logic', h1: 'Build calendar and resource timeline UIs' },
    { path: '/demo', status: 200, title: 'Demo — Headless Scheduler', h1: 'Edit a resource timeline' },
    { path: '/privacy', status: 200, title: 'Privacy — Headless Scheduler', h1: 'Privacy' },
    { path: '/terms', status: 200, title: 'Terms — Headless Scheduler', h1: 'Terms' },
    { path: '/verification-8-not-found', status: 404, title: 'Page not found — Headless Scheduler', h1: 'This page does not exist' },
  ]) {
    const response = await routePage.goto(`${base}${item.path}`, { waitUntil: 'networkidle' })
    const record = await routePage.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll('h1').length,
      h1: document.querySelector('h1')?.textContent?.trim(),
      main: Boolean(document.querySelector('main')),
      header: Boolean(document.querySelector('header')),
      footer: Boolean(document.querySelector('footer')),
      description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    }))
    assert(response?.status() === item.status, `${item.path}: expected HTTP ${item.status}, got ${response?.status()}`)
    assert(record.title === item.title && record.h1 === item.h1 && record.h1Count === 1, `${item.path}: title or H1 contract failed`)
    assert(record.lang === 'en' && record.main && record.header && record.footer && record.description && record.canonical, `${item.path}: document structure failed`)
    if (item.status === 404) await routePage.screenshot({ path: `${output}/not-found-phone.png`, fullPage: true })
    for (const href of await routePage.locator('a[href]').evaluateAll(anchors => anchors.map(anchor => anchor.href))) allHrefs.add(href)
    routes.push({ path: item.path, status: response.status(), ...record })
  }

  await routePage.goto(base, { waitUntil: 'networkidle' })
  await routePage.getByRole('link', { name: 'Privacy' }).first().click()
  await routePage.waitForURL(`${base}/privacy`)
  await routePage.waitForFunction(() => document.activeElement === document.querySelector('main h1'))
  assert(await routePage.getByRole('heading', { level: 1 }).evaluate(element => element === document.activeElement), 'SPA route did not focus Privacy H1')
  await routePage.goBack()
  await routePage.waitForURL(`${base}/`)
  await routePage.waitForFunction(() => document.activeElement === document.querySelector('main h1'))
  assert(await routePage.getByRole('heading', { level: 1 }).evaluate(element => element === document.activeElement), 'Back navigation did not focus Home H1')
  const routeNotice = await routePage.locator('.route-announcer').innerText()
  assert(routeNotice === 'Headless Scheduler — calendar and timeline logic', 'Back navigation was not announced')

  const linkResults = []
  for (const href of allHrefs) {
    if (href.includes('#')) continue
    const response = await routePage.request.get(href)
    linkResults.push({ href, status: response.status() })
    assert(response.status() >= 200 && response.status() < 400, `Broken link: ${href} returned ${response.status()}`)
  }
  await routeContext.close()

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const reducedPage = await reducedContext.newPage()
  await reducedPage.goto(`${base}/demo`, { waitUntil: 'networkidle' })
  const reducedMotion = await reducedPage.evaluate(() => {
    const event = document.querySelector('.event-block')
    return {
      matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      transitionDuration: event ? getComputedStyle(event).transitionDuration : null,
      animationDuration: event ? getComputedStyle(event).animationDuration : null,
    }
  })
  assert(reducedMotion.matches && reducedMotion.scrollBehavior === 'auto', 'Reduced-motion behavior is not active')
  await reducedContext.close()

  const report = { base, viewportResults, routes, routeFocusAndBack: true, routeNotice, linkResults, reducedMotion }
  await writeFile(`${output}/live-browser.json`, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify({ viewports: viewportResults.map(result => result.viewport.name), routes: routes.map(route => `${route.path}:${route.status}`), oneClickDemo: true, invalidRecovery: true, keyboard: true, privacy: true, routeFocusAndBack: true, links: linkResults.length, reducedMotion }))
} finally {
  await browser.close()
}
