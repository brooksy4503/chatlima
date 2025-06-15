import { test, expect } from '@playwright/test';

test.describe('ChatLima Anonymous User Test', () => {
    test('should work with anonymous authentication', async ({ page }) => {
        // Step 1: Navigate to ChatLima (using baseURL from config)
        await page.goto('/');

        // Wait for page to load
        await expect(page).toHaveTitle('ChatLima');

        // Since ChatLima supports anonymous users, we should be able to use it without signing in
        // Wait for the interface to load
        await page.waitForLoadState('networkidle');

        // Step 2: Check if message input is available (anonymous users should be able to chat)
        const messageInput = page.getByRole('textbox', { name: 'Send a message...' });
        await expect(messageInput).toBeVisible();

        // Step 3: Click on the model selector dropdown
        await page.getByRole('combobox').first().click();

        // Step 4: Select DeepSeek Chat V3 0324 model (if available for anonymous users)
        const deepSeekOption = page.getByRole('option', { name: 'DeepSeek Chat V3 0324' });
        if (await deepSeekOption.isVisible()) {
            await deepSeekOption.click();

            // Verify the model is selected (check the combobox specifically)
            await expect(page.getByRole('combobox').filter({ hasText: 'DeepSeek Chat V3 0324' })).toBeVisible();
            console.log('✅ DeepSeek model selected');
        } else {
            console.log('💡 DeepSeek model not available, testing with default model');
            // Close the dropdown by clicking somewhere else
            await page.click('h1:has-text("ChatLima")');
        }

        // Step 5: Type test message in the input field
        const testMessage = 'Hello! This is a test message from an anonymous user. Can you respond with a simple greeting?';
        await messageInput.fill(testMessage);

        // Step 6: Check if send button is enabled
        const sendButton = page.getByRole('button').filter({ hasText: '' }).nth(1);
        await expect(sendButton).toBeEnabled();

        // Step 7: Click the send button
        await sendButton.click();

        // Step 8: Wait for and verify response is received
        // Wait for the user message to appear
        await expect(page.getByText(testMessage)).toBeVisible();

        // Wait for AI response (anonymous users might have limited functionality)
        await page.waitForFunction(() => {
            const messages = document.querySelectorAll('p');
            return messages.length >= 2; // At least user message + AI response
        }, { timeout: 30000 });

        // Step 9: Verify chat appears in sidebar (if available for anonymous users)
        try {
            await expect(page.getByText('Simple Greeting Request')).toBeVisible({ timeout: 5000 });
            console.log('✅ Chat sidebar working for anonymous users');
        } catch {
            console.log('💡 Chat sidebar not available for anonymous users - this is expected');
        }

        // Step 10: Verify messages are displayed
        const allParagraphs = page.locator('p');
        await expect(allParagraphs).toHaveCount(2, { timeout: 30000 });

        // Verify user message is displayed
        await expect(page.getByText(testMessage)).toBeVisible();

        // Verify AI response is displayed (should contain some response text)
        const aiResponse = allParagraphs.nth(1);
        const responseText = await aiResponse.textContent();
        console.log('🤖 AI Response received:', responseText?.substring(0, 100) + '...');

        // Just verify that we got some response that's different from the user message
        await expect(aiResponse).not.toHaveText(testMessage);
        await expect(aiResponse).toContainText(/.+/); // At least some text

        console.log('✅ Anonymous user test completed successfully!');
        console.log('- Anonymous access working');
        console.log('- Message sent successfully');
        console.log('- Response received from AI');
        console.log('- Interface functioning for anonymous users');
    });

    test('should have proper interface elements for anonymous users', async ({ page }) => {
        // Navigate to ChatLima (using baseURL from config)
        await page.goto('/');

        // Check if ChatLima interface is loaded
        await expect(page.getByRole('heading', { name: 'ChatLima' })).toBeVisible();

        // Verify input field is ready
        await expect(page.getByRole('textbox', { name: 'Send a message...' })).toBeVisible();

        // Check if model selector is available
        await expect(page.getByRole('combobox').first()).toBeVisible();

        // Check if sign in button is visible (optional for anonymous users)
        const signInButton = page.getByRole('button', { name: 'Sign in with Google' });
        if (await signInButton.isVisible()) {
            console.log('✅ Sign in option available for upgrading');
        } else {
            console.log('💡 No sign in button visible - anonymous mode working directly');
        }

        console.log('✅ Anonymous user interface test completed!');
    });
}); 