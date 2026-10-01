// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Config de smoke tests para o site Psiângelo.
 *
 * Uso local:
 *   npm run build && npx serve out -l 3010 (outra aba)
 *   PLAYWRIGHT_BASE_URL=http://localhost:3010/Psiangelo npx playwright test
 *
 * Sem BASE_URL, tenta http://localhost:3010/Psiangelo (default do build estático).
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3010/Psiangelo';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
