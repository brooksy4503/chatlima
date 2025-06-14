import { test, expect } from '@playwright/test';

test.describe('ChatLima DeepSeek Model Test', () => {
    test('should select DeepSeek Chat V3 0324 model, send message, and receive response', async ({ page }) => {
        // Step 1: Navigate to ChatLima (using baseURL from config)
        await page.goto('/');

        // Wait for page to load
        await expect(page).toHaveTitle('ChatLima');

        // Step 2: Click on the model selector dropdown
        await page.getByRole('combobox').first().click();

        // Step 3: Select DeepSeek Chat V3 0324 model
        await page.getByRole('option', { name: 'DeepSeek Chat V3 0324' }).click();

        // Verify the model is selected - target the combobox specifically
        await expect(page.getByRole('combobox').getByText('DeepSeek Chat V3 0324')).toBeVisible();

        // Step 4: Type test message in the input field
        const testMessage = 'Hello! This is a test message. Can you respond with a simple greeting?';
        await page.getByRole('textbox', { name: 'Send a message...' }).fill(testMessage);

        // Step 5: Click the send button - target the submit button with ArrowUp icon
        const sendButton = page.locator('button[type="submit"]');
        await sendButton.click();

        // Step 6: Wait for and verify response is received
        // Wait for the user message to appear
        await expect(page.getByText(testMessage)).toBeVisible();

        // Wait for AI response with more robust approach
        await page.waitForFunction(() => {
            // Look for multiple message elements in the chat
            const chatMessages = document.querySelectorAll('[data-role="user"], [data-role="assistant"], .message, [class*="message"]');
            if (chatMessages.length >= 2) return true;

            // Fallback: look for paragraphs that might contain messages
            const paragraphs = document.querySelectorAll('p');
            return paragraphs.length >= 2;
        }, { timeout: 45000 });

        // Wait for streaming to complete - look for submit button to be enabled again
        await expect(sendButton).toBeEnabled({ timeout: 30000 });

        // Step 7: Verify chat appears in sidebar (with more flexible text matching)
        const chatTitle = page.locator('text=/Simple Greeting|Test|Chat|Hello/i').first();
        await expect(chatTitle).toBeVisible({ timeout: 10000 });

        // Step 8: Verify both messages are displayed
        const allParagraphs = page.locator('p');
        await expect(allParagraphs).toHaveCount(2, { timeout: 30000 });

        // Verify user message is displayed
        await expect(page.getByText(testMessage)).toBeVisible();

        // Verify AI response is displayed (should contain greeting-like text)
        const aiResponse = allParagraphs.nth(1);
        await expect(aiResponse).toContainText(/hello|hi|thanks|great|day|greeting/i);

        // Verify copy buttons are present - wait for streaming to complete first
        await expect(page.getByRole('button', { name: 'Copy' })).toHaveCount(2, { timeout: 10000 });

        // Additional verification: Ensure the model is still selected - target combobox specifically
        await expect(page.getByRole('combobox').getByText('DeepSeek Chat V3 0324')).toBeVisible();

        console.log('✅ Test completed successfully!');
        console.log('- Model selected: DeepSeek Chat V3 0324');
        console.log('- Message sent successfully');
        console.log('- Response received from AI');
        console.log('- Chat created in sidebar');
        console.log('- Both messages displayed correctly');
    });

    test('should handle model selection and maintain state', async ({ page }) => {
        // Navigate to ChatLima (using baseURL from config)
        await page.goto('/');

        // Open model selector
        await page.getByRole('combobox').first().click();

        // Verify DeepSeek model is available
        await expect(page.getByRole('option', { name: 'DeepSeek Chat V3 0324' })).toBeVisible();

        // Select the model
        await page.getByRole('option', { name: 'DeepSeek Chat V3 0324' }).click();

        // Verify model persists after selection - target combobox specifically
        await expect(page.getByRole('combobox').getByText('DeepSeek Chat V3 0324')).toBeVisible();

        // Verify input field is ready
        await expect(page.getByRole('textbox', { name: 'Send a message...' })).toBeVisible();

        // Verify send button starts disabled - target the submit button
        const sendButton = page.locator('button[type="submit"]');
        await expect(sendButton).toBeDisabled();

        // Type a message to enable send button
        await page.getByRole('textbox', { name: 'Send a message...' }).fill('test');
        await expect(sendButton).toBeEnabled();
    });
}); 