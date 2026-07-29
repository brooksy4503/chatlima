import { test, expect } from '@playwright/test';
import { gotoApp } from '../playwright.shared';

test.describe('ChatLima Basic UI Tests', () => {
    test('should load public landing page', async ({ page }) => {
        await gotoApp(page, '/');

        await expect(page).toHaveTitle(/ChatLima.*Multi-Model AI Chat/i);
        await expect(
            page.getByRole('heading', { name: /ChatLima — use the best AI model for every task/i })
        ).toBeVisible();
        await expect(page.getByRole('link', { name: /Start chatting/i }).first()).toHaveAttribute(
            'href',
            '/chat'
        );
        await expect(page.getByPlaceholder('Send a message...')).toHaveCount(0);
        await expect(page.getByRole('button', { name: /Open sidebar/i })).toHaveCount(0);
    });

    test('should load page and display core interface elements', async ({ page }) => {
        await gotoApp(page, '/chat');

        await expect(page).toHaveTitle(/ChatLima/);
        await expect(page.getByRole('heading', { name: 'Start a conversation' })).toBeVisible();
        await expect(page.getByPlaceholder('Send a message...')).toBeVisible();

        // Prefer named model picker (stable across loading / error / ready)
        const modelPicker = page.getByRole('combobox', { name: /select model/i });
        await expect(modelPicker).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should handle message input field interactions', async ({ page }) => {
        await gotoApp(page, '/chat');

        const messageInput = page.getByPlaceholder('Send a message...');
        await expect(messageInput).toHaveValue('');

        const testMessage = 'This is a test message';
        await messageInput.fill(testMessage);
        await expect(messageInput).toHaveValue(testMessage);

        await messageInput.clear();
        await expect(messageInput).toHaveValue('');
        await expect(messageInput).toHaveAttribute('placeholder', 'Send a message...');
    });

    test('should interact with model picker', async ({ page }) => {
        await gotoApp(page, '/chat');

        const modelPicker = page.getByRole('combobox', { name: /select model/i });
        await expect(modelPicker).toBeVisible();
        // Ready state is enabled; loading/error may be disabled — still a real control
        await expect(modelPicker.locator('span').first()).not.toBeEmpty();

        // When models loaded, focus still works
        if (await modelPicker.isEnabled()) {
            await modelPicker.focus();
            await page.getByPlaceholder('Send a message...').click();
            await expect(modelPicker).toBeVisible();
            await expect(modelPicker).toBeEnabled();
        }
    });

    test('should navigate to new chat when clicking app logo link', async ({ page }) => {
        await gotoApp(page, '/chat');

        const logoLink = page.getByRole('link', { name: /ChatLima/i }).first();
        await expect(logoLink).toBeVisible();
        await logoLink.click();

        await expect(page).toHaveURL('/chat');
        await expect(page).toHaveTitle(/ChatLima/);
    });

    test('should toggle sidebar open and close', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await gotoApp(page, '/chat');

        // Prefer data attribute (stable); fall back to accessible name
        const sidebarToggle = page
            .locator('[data-sidebar="trigger"]')
            .or(page.getByRole('button', { name: /sidebar/i }))
            .first();
        await expect(sidebarToggle).toBeVisible();

        await sidebarToggle.click();
        await expect(sidebarToggle).toBeVisible();
        await expect(sidebarToggle).toBeEnabled();

        await sidebarToggle.click();
        await expect(sidebarToggle).toBeVisible();
        await expect(sidebarToggle).toBeEnabled();
    });

    test('should interact with new chat button in sidebar', async ({ page }) => {
        await gotoApp(page, '/chat');

        const newChatButton = page.getByRole('button', { name: 'Start new chat' });
        await expect(newChatButton).toBeVisible();
        await expect(newChatButton).toBeEnabled();

        await Promise.all([
            page.waitForURL('/chat'),
            newChatButton.click(),
        ]);

        await expect(page).toHaveTitle(/ChatLima/);
        await expect(page.getByPlaceholder('Send a message...')).toBeVisible();
    });
});
