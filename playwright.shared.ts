import type { ReporterDescription } from '@playwright/test';

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
  timeout: 120_000,
};
