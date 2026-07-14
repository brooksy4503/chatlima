import { defineConfig, devices } from '@playwright/test';
import {
  gotoApp,
  playwrightReporters,
  playwrightSharedUse,
  playwrightSharedWorkers,
  playwrightTestTimeout,
  playwrightWebServer,
} from './playwright.shared';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: playwrightSharedWorkers,
    timeout: playwrightTestTimeout,
    expect: { timeout: 15_000 },
    reporter: playwrightReporters,

    use: {
        baseURL: 'http://localhost:3000',
        ...playwrightSharedUse,
    },

    projects: [
        {
            name: 'basic-ui-chrome',
            use: {
                ...devices['Desktop Chrome'],
            },
            testMatch: /.*basic-ui.*\.spec\.ts/,
        },
        {
            name: 'branching-ui-chrome',
            use: {
                ...devices['Desktop Chrome'],
            },
            testMatch: /.*conversation-branching.*\.spec\.ts/,
        },
    ],

    webServer: playwrightWebServer,
});

export { gotoApp };
