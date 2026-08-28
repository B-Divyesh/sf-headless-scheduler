import { readFile } from 'node:fs/promises'

const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8'))
const tests = await readFile('tests/claims.spec.ts', 'utf8')
const ids = new Set()
for (const claim of claims) {
  if (!claim.id || !claim.claim || !claim.where || !claim.test || !claim.sandbox) throw new Error(`Incomplete claim entry: ${JSON.stringify(claim)}`)
  if (ids.has(claim.id)) throw new Error(`Duplicate claim id: ${claim.id}`)
  ids.add(claim.id)
  const tag = `@claim:${claim.id}`
  const count = tests.split(tag).length - 1
  if (count !== 1) throw new Error(`${tag} appears ${count} times in tests/claims.spec.ts; expected exactly once`)
  if (!claim.test.endsWith(`--grep ${tag}`)) throw new Error(`${claim.id} does not run its exact tagged test`)
}
const testTags = [...tests.matchAll(/@claim:([a-z0-9-]+)/g)].map(match => match[1])
for (const id of testTags) if (!ids.has(id)) throw new Error(`Unregistered test tag: @claim:${id}`)
console.log(JSON.stringify({ claims: claims.length, uniqueTags: new Set(testTags).size, exactOneToOne: true }))
