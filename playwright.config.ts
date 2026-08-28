import { defineConfig } from '@playwright/test'

const liveBaseURL = process.env.CLAIMS_BASE_URL

export default defineConfig({
  testDir: './tests',
  testMatch: 'claims.spec.ts',
  fullyParallel: false,
  timeout: 120_000,
  retries: 0,
  workers: 1,
  reporter: [['line'], ['json', { outputFile: '.factory/evidence/claims.json' }]],
  outputDir: '.factory/evidence/claims-artifacts',
  use: { baseURL: liveBaseURL ?? 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: liveBaseURL
    ? undefined
    : { command: 'node scripts/serve-site.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
})
