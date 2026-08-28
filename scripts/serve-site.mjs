import { resolve } from 'node:path'
import { startStaticSite } from './site-server.mjs'

const server = await startStaticSite(resolve('dist/site'), 4173)
console.log(`Headless Scheduler test server: ${server.url}`)
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0) })
