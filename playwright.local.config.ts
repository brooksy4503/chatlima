import { defineConfig, devices } from '@playwright/test';
import { playwrightReporters, playwrightWebServer } from './playwright.shared';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: playwrightReporters,

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        // Setup project to authenticate once (only for authenticated tests)
        {
            name: 'local-setup',
            testMatch: /.*local\.setup\.ts/,
        },

        // Anonymous user tests (no auth required)
        {
            name: 'local-anonymous-chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
            testMatch: /.*anonymous.*\.spec\.ts/,
        },

        // Authenticated user tests (require auth setup)
        {
            name: 'local-authenticated-chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Use the authenticated state
                storageState: 'playwright/.auth/local-user.json',
            },
            dependencies: ['local-setup'],
            testMatch: /.*deepseek.*\.spec\.ts/,
        },
    ],

    webServer: playwrightWebServer,
}); 