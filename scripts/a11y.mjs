import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import axe from 'axe-core'
import { startStaticSite } from './site-server.mjs'

const require = createRequire(import.meta.url)
const { chromium } = require('/usr/lib/node_modules/playwright')
const externalUrl = process.argv[2]
const output = process.argv[3] ?? '.factory/evidence/axe.json'
const server = externalUrl ? null : await startStaticSite(resolve('dist/site'))
const url = (externalUrl ?? server.url).replace(/\/$/, '')
const browser = await chromium.launch()
try {
  // axe is injected only by this local test harness. Keep production CSP strict.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, bypassCSP: true })
  const results = []
  for (const route of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
    const page = await context.newPage()
    await page.goto(`${url}${route}`, { waitUntil: 'networkidle' })
    await page.addScriptTag({ content: axe.source })
    const result = await page.evaluate(async () => window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }))
    results.push({ route, violations: result.violations })
    await page.close()
  }
  await writeFile(output, JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ url, routes: results.map(result => ({ route: result.route, violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })) })) }))
  if (results.some(result => result.violations.some(item => item.impact === 'serious' || item.impact === 'critical'))) process.exitCode = 1
  await context.close()
} finally {
  await browser.close()
  await server?.close()
}
