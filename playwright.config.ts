import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config (§21). Drives the app against Mock Service Worker with
 * the isolated test principal — never a real backend, Entra, or Anthropic. The
 * dev server is started in test mode (VITE_ENABLE_MSW=true, VITE_AUTH_MODE=test).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_ENABLE_MSW: 'true',
      VITE_AUTH_MODE: 'test',
    },
  },
});
