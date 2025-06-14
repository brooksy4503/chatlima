import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/local-user.json';

setup('authenticate locally', async ({ page }) => {
    console.log('🔐 Starting local authentication setup...');

    // Go to local ChatLima
    await page.goto('/', { waitUntil: 'networkidle' });

    // Take a screenshot to see what we're dealing with
    await page.screenshot({ path: 'playwright-report/local-auth-step-1-initial-load.png' });

    // Check what page we're on
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);

    // Wait for the page to stabilize
    await page.waitForTimeout(2000);

    // Check if we have ChatLima interface
    const chatLimaHeading = page.locator('h1:has-text("ChatLima")');
    const signInButton = page.getByRole('button', { name: 'Sign in with Google' });

    // Verify we have the ChatLima interface
    await expect(chatLimaHeading).toBeVisible();
    console.log('✅ ChatLima interface detected on localhost');

    // Check if we need to sign in
    if (await signInButton.isVisible()) {
        console.log('🔑 Sign in button available - for local testing, we can continue with anonymous user');
        console.log('💡 Local development typically supports anonymous users out of the box');
    } else {
        console.log('✅ Already authenticated or anonymous access available');
    }

    // Wait for the interface to settle
    await page.waitForTimeout(2000);

    // Save authentication state (anonymous state for local)
    await page.context().storageState({ path: authFile });

    console.log('💾 Local authentication state saved to:', authFile);
    console.log('✨ Local authentication setup completed');
}); 