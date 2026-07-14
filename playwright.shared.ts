import type { ReporterDescription } from '@playwright/test';
import { expect } from '@playwright/test';

/** Avoid hanging on the HTML report server after a local test run. */
export const playwrightReporters: ReporterDescription[] = [
  ['list'],
  ['html', { open: 'never' }],
];

export const playwrightWebServer = {
  command: 'pnpm dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  stdout: 'ignore' as const,
  stderr: 'pipe' as const,
  timeout: 180_000,
};

/** Shared Playwright settings for local dev-server E2E. */
export const playwrightSharedUse = {
  trace: 'on-first-retry' as const,
  screenshot: 'only-on-failure' as const,
  video: 'retain-on-failure' as const,
  navigationTimeout: 60_000,
  actionTimeout: 15_000,
};

/** Dev server + Turbopack compile slowly under parallel load — run serially. */
export const playwrightSharedWorkers = 1;

/** Default per-test timeout (ms). */
export const playwrightTestTimeout = 60_000;

/** Prefer domcontentloaded — Next.js dev "load" can hang on long-polling/HMR. */
export async function gotoApp(
  page: import('@playwright/test').Page,
  path: string
): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  if (path.startsWith('/chat')) {
    await expect(page.getByPlaceholder('Send a message...')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole('combobox').first()).toBeVisible({
      timeout: 30_000,
    });
  }
}
