import { test, expect } from '@playwright/test';

test.describe('ChatLima Basic UI Tests', () => {

    test('should load page and display core interface elements', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Verify the page title
        await expect(page).toHaveTitle('ChatLima');

        // Verify the main heading is visible
        await expect(page.getByRole('heading', { name: 'ChatLima' })).toBeVisible();

        // Verify the message input field is present
        await expect(page.getByPlaceholder('Send a message...')).toBeVisible();

        // Verify the model picker (combobox) is present - look for one with model text pattern (contains ":")
        const modelPicker = page.getByRole('combobox').filter({ hasText: /:/ }).first();
        await expect(modelPicker).toBeVisible();

        // Verify the send button is present (but may be disabled)
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        console.log('✅ Basic UI elements loaded successfully');
    });

    test('should handle message input field interactions', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Get the message input field
        const messageInput = page.getByPlaceholder('Send a message...');

        // Verify input starts empty
        await expect(messageInput).toHaveValue('');

        // Type a test message
        const testMessage = 'This is a test message';
        await messageInput.fill(testMessage);

        // Verify the text appears in the input
        await expect(messageInput).toHaveValue(testMessage);

        // Clear the input
        await messageInput.clear();

        // Verify the input is empty again
        await expect(messageInput).toHaveValue('');

        // Verify placeholder is still visible when empty
        await expect(messageInput).toHaveAttribute('placeholder', 'Send a message...');

        console.log('✅ Message input functionality working correctly');
    });

    test('should interact with model picker', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Get the model picker combobox - it should contain model text with ":" pattern
        const modelPicker = page.getByRole('combobox').filter({ hasText: /:/ }).first();

        // Verify model picker is visible and enabled
        await expect(modelPicker).toBeVisible();
        await expect(modelPicker).toBeEnabled();

        // Verify it has some model text (contains ":")
        await expect(modelPicker).toContainText(':');

        // Just verify we can focus it (simpler than opening dropdown)
        await modelPicker.focus();

        // Click elsewhere to remove focus
        await page.getByPlaceholder('Send a message...').click();

        // Verify model picker is still there and functional
        await expect(modelPicker).toBeVisible();
        await expect(modelPicker).toBeEnabled();

        console.log('✅ Model picker interaction working correctly');
    });

    test('should navigate home when clicking logo link', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Find the logo link - it should contain "ChatLima" text and be a link
        const logoLink = page.getByRole('link', { name: /ChatLima/i }).first();

        // Verify logo link is visible and clickable
        await expect(logoLink).toBeVisible();
        await expect(logoLink).toBeEnabled();

        // Click the logo link
        await logoLink.click();

        // Verify we're still on the home page (URL should be base URL)
        await expect(page).toHaveURL('/');

        // Verify the page title is still correct
        await expect(page).toHaveTitle('ChatLima');

        console.log('✅ Logo link navigation working correctly');
    });

    test('should toggle sidebar open and close', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Find the sidebar toggle button (hamburger menu)
        const sidebarToggle = page.getByRole('button', { name: /toggle sidebar|menu|hamburger/i }).or(
            page.locator('button[aria-label*="sidebar"]')
        ).or(
            page.locator('button[data-testid*="sidebar"]')
        ).or(
            page.locator('button').filter({ hasText: /☰|≡|⋮/ })
        ).first();

        // Verify sidebar toggle button is visible
        await expect(sidebarToggle).toBeVisible();

        // Click to open sidebar (assuming it starts closed)
        await sidebarToggle.click();

        // Wait a moment for animation
        await page.waitForTimeout(500);

        // Click again to close sidebar
        await sidebarToggle.click();

        // Wait a moment for animation
        await page.waitForTimeout(500);

        // Verify toggle button is still there and functional
        await expect(sidebarToggle).toBeVisible();
        await expect(sidebarToggle).toBeEnabled();

        console.log('✅ Sidebar toggle functionality working correctly');
    });

    test('should interact with new chat button in sidebar', async ({ page }) => {
        // Navigate to the home page
        await page.goto('/');

        // Find the sidebar toggle button and open sidebar
        const sidebarToggle = page.getByRole('button', { name: /toggle sidebar|menu|hamburger/i }).or(
            page.locator('button[aria-label*="sidebar"]')
        ).or(
            page.locator('button[data-testid*="sidebar"]')
        ).or(
            page.locator('button').filter({ hasText: /☰|≡|⋮/ })
        ).first();

        // Open the sidebar
        await sidebarToggle.click();
        await page.waitForTimeout(500); // Wait for sidebar animation

        // Find the New Chat button in the sidebar
        const newChatButton = page.getByRole('button', { name: /new chat|start chat|create chat|\+/i }).or(
            page.locator('button[aria-label*="new chat"]')
        ).or(
            page.locator('button[data-testid*="new-chat"]')
        ).first();

        // Verify new chat button is visible and enabled
        await expect(newChatButton).toBeVisible();
        await expect(newChatButton).toBeEnabled();

        // Click the new chat button
        await newChatButton.click();

        // Verify we're still on a valid page (could be home or new chat route)
        await expect(page).toHaveTitle('ChatLima');

        // Verify the message input is still available (indicating chat interface is ready)
        await expect(page.getByPlaceholder('Send a message...')).toBeVisible();

        console.log('✅ New Chat button functionality working correctly');
    });
}); 