import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',

    use: {
        baseURL: 'https://preview.chatlima.com',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        // Setup project to authenticate once (only for authenticated tests)
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },

        // Anonymous user tests (no auth required)
        {
            name: 'anonymous-chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
            testMatch: /.*anonymous.*\.spec\.ts/,
        },

        // Authenticated user tests (require auth setup)
        {
            name: 'authenticated-chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Use the authenticated state
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testMatch: /.*deepseek.*\.spec\.ts/,
        },
        {
            name: 'authenticated-firefox',
            use: {
                ...devices['Desktop Firefox'],
                // Use the authenticated state
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testMatch: /.*deepseek.*\.spec\.ts/,
        },
        {
            name: 'authenticated-webkit',
            use: {
                ...devices['Desktop Safari'],
                // Use the authenticated state
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
            testMatch: /.*deepseek.*\.spec\.ts/,
        },
    ],

    webServer: {
        command: 'echo "Using external ChatLima server"',
        url: 'https://preview.chatlima.com',
        reuseExistingServer: true,
        timeout: 120 * 1000,
    },
}); 