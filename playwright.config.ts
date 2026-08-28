import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: 'claims.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['line'], ['json', { outputFile: '.factory/evidence/claims.json' }]],
  outputDir: '.factory/evidence/claims-artifacts',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'node scripts/serve-site.mjs', url: 'http://127.0.0.1:4173', reuseExistingServer: false },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
})
