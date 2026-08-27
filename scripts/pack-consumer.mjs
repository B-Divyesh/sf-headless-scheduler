import { spawn } from 'node:child_process'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = resolve('.')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const run = (command, args, options = {}) => new Promise((resolvePromise, reject) => {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit', ...options })
  child.on('error', reject)
  child.on('exit', code => code === 0 ? resolvePromise() : reject(new Error(`${command} ${args.join(' ')} exited ${code}`)))
})

await rm(resolve(root, 'dist/package'), { recursive: true, force: true })
const packed = await new Promise((resolvePromise, reject) => {
  let output = ''
  const child = spawn(npm, ['pack', '--json'], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] })
  child.stdout.on('data', chunk => { output += chunk })
  child.on('error', reject)
  child.on('exit', code => {
    if (code !== 0) return reject(new Error(`npm pack exited ${code}`))
    const json = output.match(/(\[\s*\{[\s\S]*\]\s*)$/)?.[1]
    if (!json) return reject(new Error('npm pack did not return its JSON manifest'))
    resolvePromise(JSON.parse(json)[0])
  })
})
const tarball = resolve(root, packed.filename)
const expected = ['index.js', 'index.cjs', 'index.d.ts', 'react.js', 'react.cjs', 'react.d.ts', 'preset.css']
const names = new Set(packed.files.map(file => file.path.replace(/^package\//, '')))
for (const target of expected) if (!names.has(`dist/package/${target}`)) throw new Error(`Packed tarball is missing dist/package/${target}`)

const consumer = await mkdtemp(join(tmpdir(), 'headless-scheduler-consumer-'))
try {
  await writeFile(join(consumer, 'package.json'), JSON.stringify({ private: true, type: 'module' }))
  await run(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball, 'react@19.1.0'], { cwd: consumer })
  for (const target of expected) await access(join(consumer, 'node_modules/headless-scheduler/dist/package', target))
  await run(process.execPath, ['--input-type=module', '--eval', "import { createScheduler } from 'headless-scheduler'; import { HeadlessScheduler } from 'headless-scheduler/react'; if (typeof createScheduler !== 'function' || typeof HeadlessScheduler !== 'function') process.exit(1)"], { cwd: consumer })
  await run(process.execPath, ['--eval', "const core = require('headless-scheduler'); const react = require('headless-scheduler/react'); if (typeof core.createScheduler !== 'function' || typeof react.HeadlessScheduler !== 'function') process.exit(1)"], { cwd: consumer })
  const packageJson = JSON.parse(await readFile(join(consumer, 'node_modules/headless-scheduler/package.json'), 'utf8'))
  for (const target of [packageJson.main, packageJson.module, packageJson.types, packageJson.exports['.'].import, packageJson.exports['.'].require, packageJson.exports['.'].types, packageJson.exports['./react'].import, packageJson.exports['./react'].require, packageJson.exports['./react'].types, packageJson.exports['./preset.css']]) await access(join(consumer, 'node_modules/headless-scheduler', target))
  console.log(JSON.stringify({ cleanPack: true, consumerImports: ['esm', 'cjs', 'react'], targets: expected.length }))
} finally {
  await rm(consumer, { recursive: true, force: true })
  await rm(tarball, { force: true })
}
