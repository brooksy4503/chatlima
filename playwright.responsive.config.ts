import { defineConfig, devices } from '@playwright/test';
import { playwrightReporters, playwrightWebServer } from './playwright.shared';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    workers: 1,
    reporter: playwrightReporters,
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'responsive-chromium',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*sidebar-chatlist-responsiveness.*\.spec\.ts/,
        },
    ],
    webServer: playwrightWebServer,
});
