import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 1, // Simple retry strategy
    workers: process.env.CI ? 1 : 2, // Reduced parallelism for reliability
    reporter: 'html',

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
    ],

    // Run dev server before tests
    webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120000, // 2 minutes to start dev server
    },
}); 