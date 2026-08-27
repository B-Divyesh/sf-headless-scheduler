import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { startStaticSite } from './site-server.mjs'

const root = resolve('dist/site')
const external = process.argv[2]
const server = external ? null : await startStaticSite(root)
const base = (external ?? server.url).replace(/\/$/, '')
try {
  const home = await fetch(`${base}/`)
  const html = await home.text()
  const asset = html.match(/src="(\/assets\/[^"?]+\.js)"/)?.[1]
  if (!asset) throw new Error('Could not find emitted JavaScript asset')
  const [script, worker] = await Promise.all([fetch(`${base}${asset}`), fetch(`${base}/sw.js`)])
  const checks = [
    [home, 'Cache-Control', 'no-store'], [script, 'Cache-Control', 'immutable'], [worker, 'Cache-Control', 'no-cache'],
    [home, 'Content-Security-Policy', "frame-ancestors 'none'"], [home, 'X-Frame-Options', 'DENY'],
    [home, 'Permissions-Policy', 'geolocation=()'], [home, 'Cross-Origin-Opener-Policy', 'same-origin'], [home, 'Cross-Origin-Resource-Policy', 'same-origin']
  ]
  for (const [response, header, value] of checks) if (!response.headers.get(header)?.includes(value)) throw new Error(`Missing ${header}: ${value}`)
  const config = JSON.parse(await readFile(resolve(root, 'staticwebapp.config.json'), 'utf8'))
  if (!config.globalHeaders?.['Content-Security-Policy']) throw new Error('Static Web Apps CSP is missing')
  console.log(JSON.stringify({ headerChecks: checks.length, url: base }))
} finally { await server?.close() }
