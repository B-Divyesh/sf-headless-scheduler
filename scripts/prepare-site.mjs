import { spawn } from 'node:child_process'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve('.')
const site = resolve(process.env.SITE_OUT_DIR ?? 'dist/site')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const release = process.env.VITE_DOCS_BUILD_MARKER ?? 'release'

const index = resolve(site, 'index.html')
const homeHtml = (await readFile(index, 'utf8')).replace('__DOCS_RELEASE__', release)
await writeFile(index, homeHtml)

const routeMetadata = {
  demo: {
    title: 'Demo — Headless Scheduler',
    description: 'Edit sample event data and try the Headless Scheduler package with isolated in-memory data.',
    canonical: '/demo'
  },
  privacy: {
    title: 'Privacy — Headless Scheduler',
    description: 'How the Headless Scheduler site and package handle data, storage, and network access.',
    canonical: '/privacy'
  },
  terms: {
    title: 'Terms — Headless Scheduler',
    description: 'License and usage terms for the Headless Scheduler package and documentation site.',
    canonical: '/terms'
  },
  '404': {
    title: 'Page not found — Headless Scheduler',
    description: 'The requested Headless Scheduler page does not exist.',
    canonical: '/404.html'
  }
}

function htmlForRoute({ title, description, canonical }) {
  const url = `https://headless-scheduler.sociobot.in${canonical}`
  return homeHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(" \/>)/, `$1${url}$2`)
}

const pack = await new Promise((resolvePromise, reject) => {
  let output = ''
  const child = spawn(npm, ['pack', '--ignore-scripts', '--json'], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] })
  child.stdout.on('data', chunk => { output += chunk })
  child.on('error', reject)
  child.on('exit', code => {
    if (code !== 0) return reject(new Error(`npm pack exited ${code}`))
    const json = output.match(/(\[\s*\{[\s\S]*\]\s*)$/)?.[1]
    if (!json) return reject(new Error('npm pack did not return a JSON manifest'))
    resolvePromise(JSON.parse(json)[0].filename)
  })
})

await rename(resolve(root, pack), resolve(site, 'headless-scheduler-0.1.0.tgz'))
for (const route of ['demo', 'privacy', 'terms']) {
  await mkdir(resolve(site, route), { recursive: true })
  await writeFile(resolve(site, route, 'index.html'), htmlForRoute(routeMetadata[route]))
}
await writeFile(resolve(site, '404.html'), htmlForRoute(routeMetadata['404']))
console.log(JSON.stringify({ routes: ['/', '/demo', '/privacy', '/terms', '/404.html'], package: 'headless-scheduler-0.1.0.tgz' }))
