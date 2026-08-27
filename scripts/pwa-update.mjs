import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { startStaticSite } from './site-server.mjs'

const root = resolve('.')
const require = createRequire(import.meta.url)
const { chromium } = require('/usr/lib/node_modules/playwright')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const run = (env) => new Promise((resolvePromise, reject) => {
  const child = spawn(npm, ['run', 'build:site'], { cwd: root, env: { ...process.env, ...env }, stdio: 'inherit' })
  child.on('error', reject)
  child.on('exit', code => code === 0 ? resolvePromise() : reject(new Error(`build:site exited ${code}`)))
})

const temporary = await mkdtemp(join(tmpdir(), 'headless-scheduler-pwa-update-'))
const oldSite = join(temporary, 'old')
const newSite = join(temporary, 'new')
const server = await (async () => { await run({ SITE_OUT_DIR: oldSite, VITE_DOCS_BUILD_MARKER: 'old-build' }); return startStaticSite(oldSite) })()
const browser = await chromium.launch()
try {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(server.url, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null)
  if (await page.locator('meta[name="docs-release"]').getAttribute('content') !== 'old-build') throw new Error('Old documentation shell did not load')
  await page.waitForFunction(async () => {
    const keys = await caches.keys()
    return (await Promise.all(keys.filter(key => key.startsWith('headless-scheduler-docs-')).map(async key => (await caches.open(key)).keys()))).some(entries => entries.length > 1)
  })
  const oldCaches = await page.evaluate(() => caches.keys())
  await run({ SITE_OUT_DIR: newSite, VITE_DOCS_BUILD_MARKER: 'new-build' })
  const newCache = (await readFile(join(newSite, 'sw.js'), 'utf8')).match(/const CACHE = '([^']+)'/)?.[1]
  if (!newCache) throw new Error('Could not read generated service-worker cache version')
  server.setRoot(newSite)
  if (!(await (await fetch(server.url)).text()).includes('new-build')) throw new Error('Test server did not switch to the new build')
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration?.update() })
  await page.waitForFunction(previous => caches.keys().then(keys =>
    keys.some(key => key.startsWith('headless-scheduler-docs-') && !previous.includes(key)) && previous.every(key => !keys.includes(key))
  ), oldCaches)
  await page.waitForFunction(cache => new Promise(resolvePromise => {
    const controller = navigator.serviceWorker.controller
    if (!controller) return resolvePromise(false)
    const channel = new MessageChannel()
    channel.port1.onmessage = event => resolvePromise(event.data?.cache === cache)
    controller.postMessage('headless-scheduler-cache-version', [channel.port2])
  }), newCache)
  await page.waitForFunction(async cache => {
    const response = await (await caches.open(cache)).match('/index.html')
    return (await response?.text())?.includes('new-build')
  }, newCache)
  // This is the old-shell regression: a newly opened client must get the new
  // shell even when its navigation is initially dispatched to the old worker.
  // Navigation is network-first so that hand-off cannot paint a stale shell.
  const updatedPage = await context.newPage()
  await updatedPage.goto(`${server.url}/?after-update=1`, { waitUntil: 'domcontentloaded' })
  if (await updatedPage.locator('meta[name="docs-release"]').getAttribute('content') !== 'new-build') throw new Error('Updated service worker did not serve the new shell')
  await updatedPage.waitForFunction(cache => new Promise(resolvePromise => {
    const controller = navigator.serviceWorker.controller
    if (!controller) return resolvePromise(false)
    const channel = new MessageChannel()
    channel.port1.onmessage = event => resolvePromise(event.data?.cache === cache)
    controller.postMessage('headless-scheduler-cache-version', [channel.port2])
  }), newCache)
  // Once the new client is controlled, a second offline navigation proves it
  // is reading that activated worker's cached new shell rather than the server.
  await context.setOffline(true)
  await updatedPage.reload({ waitUntil: 'domcontentloaded' })
  if (await updatedPage.locator('meta[name="docs-release"]').getAttribute('content') !== 'new-build') throw new Error('Updated service worker did not serve its cached new shell offline')
  await context.setOffline(false)
  const cachesAfter = await page.evaluate(() => caches.keys())
  if (cachesAfter.some(key => oldCaches.includes(key))) throw new Error('Old service-worker cache was not removed')
  console.log(JSON.stringify({ pwaUpdate: 'old-to-new', oldCaches, newCaches: cachesAfter }))
  await context.close()
} finally {
  await browser.close()
  await server.close()
  await rm(temporary, { recursive: true, force: true })
}
