import { spawn } from 'node:child_process'
import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve('.')
const site = resolve(process.env.SITE_OUT_DIR ?? 'dist/site')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const release = process.env.VITE_DOCS_BUILD_MARKER ?? 'release'

const index = resolve(site, 'index.html')
await writeFile(index, (await readFile(index, 'utf8')).replace('__DOCS_RELEASE__', release))

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
  await copyFile(index, resolve(site, route, 'index.html'))
}
await copyFile(index, resolve(site, '404.html'))
console.log(JSON.stringify({ routes: ['/', '/demo', '/privacy', '/terms', '/404.html'], package: 'headless-scheduler-0.1.0.tgz' }))
