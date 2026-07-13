import { defineConfig, devices } from '@playwright/test';
import { playwrightReporters, playwrightWebServer } from './playwright.shared';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 1,
    workers: process.env.CI ? 1 : 2,
    reporter: playwrightReporters,

    use: {
        baseURL: 'http://localhost:3000', // Local development server
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000, // 10 second timeout for actions
    },

    // Simple projects - just basic UI tests on local dev server
    projects: [
        {
            name: 'basic-ui-chrome',
            use: {
                ...devices['Desktop Chrome'],
            },
            testMatch: /.*basic-ui.*\.spec\.ts/,
        },
        {
            name: 'basic-ui-firefox',
            use: {
                ...devices['Desktop Firefox'],
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