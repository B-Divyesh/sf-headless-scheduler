import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const claims = JSON.parse(readFileSync(resolve('.factory/claims.json'), 'utf8'))
const output = resolve(process.env.CLAIM_MATRIX_OUTPUT ?? '.factory/evidence/polish-1/claim-matrix.json')
const playwright = resolve('node_modules/.bin/playwright')
const results = []

for (const claim of claims) {
  const startedAt = new Date().toISOString()
  const started = performance.now()
  const result = spawnSync(
    playwright,
    ['test', '--config', 'playwright.config.ts', '--grep', `@claim:${claim.id}`],
    { env: process.env, encoding: 'utf8' },
  )
  const record = {
    id: claim.id,
    test: claim.test,
    status: result.status === 0 ? 'passed' : 'failed',
    startedAt,
    durationMs: Math.round(performance.now() - started),
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim(),
  }
  results.push(record)
  process.stdout.write(`${record.status === 'passed' ? 'PASS' : 'FAIL'} ${claim.id} (${record.durationMs} ms)\n`)
  if (result.status !== 0) break
}

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, `${JSON.stringify({ baseURL: process.env.CLAIMS_BASE_URL ?? 'local', results }, null, 2)}\n`)

if (results.length !== claims.length || results.some((result) => result.status !== 'passed')) process.exit(1)
