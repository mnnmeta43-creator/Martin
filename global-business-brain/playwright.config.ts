import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests on phone and desktop viewports.
 * Runs against `next start` with DATA_MODE=demo and an in-memory embedded database,
 * so the full flow can be exercised without network access to data sources.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH ?? (process.env.CI ? undefined : '/opt/pw-browsers/chromium-1194/chrome-linux/chrome');

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    locale: 'sq-AL',
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    { name: 'telefon', use: { ...devices['Pixel 7'], launchOptions: executablePath ? { executablePath } : undefined } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions: executablePath ? { executablePath } : undefined } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATA_MODE: 'demo',
      ALLOW_EMBEDDED_DB: 'true',
      PGLITE_DATA_DIR: 'memory://',
      NODE_ENV: 'production',
    },
  },
});
