import { test, expect } from '@playwright/test';

test.describe('Presets feature', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // sign in logic if needed
    });

    test('should create a new preset', async ({ page }) => {
        await page.click('button:has-text("Model")');
        await page.click('button:has-text("Create Preset")');
        await page.fill('input[name="name"]', 'My Test Preset');
        await page.click('button:has-text("Create")');
        await expect(page.locator('text=My Test Preset')).toBeVisible();
    });

    test('should update a preset', async ({ page }) => {
        // First create a preset
        await page.click('button:has-text("Model")');
        await page.click('button:has-text("Create Preset")');
        await page.fill('input[name="name"]', 'Preset to Update');
        await page.click('button:has-text("Create")');

        // Now update it
        await page.click('button:has-text("Edit")');
        await page.fill('input[name="name"]', 'Updated Preset');
        await page.click('button:has-text("Update")');
        await expect(page.locator('text=Updated Preset')).toBeVisible();
    });

    test('should delete a preset', async ({ page }) => {
        // First create a preset
        await page.click('button:has-text("Model")');
        await page.click('button:has-text("Create Preset")');
        await page.fill('input[name="name"]', 'Preset to Delete');
        await page.click('button:has-text("Create")');

        // Now delete it
        await page.click('button:has-text("Delete")');
        await expect(page.locator('text=Preset to Delete')).not.toBeVisible();
    });

    test('should share a preset and apply it from URL', async ({ page }) => {
        // First create a preset
        await page.click('button:has-text("Model")');
        await page.click('button:has-text("Create Preset")');
        await page.fill('input[name="name"]', 'Shared Preset');
        await page.click('button:has-text("Create")');

        // Get the share URL
        const shareButton = page.locator('button:has-text("Share")');
        const presetId = await shareButton.getAttribute('data-preset-id');
        const shareUrl = `/chat/new?preset=${presetId}`;

        // go to the share url
        await page.goto(shareUrl);

        // check if the model is selected
        // This part depends on how the preset selection is reflected in the UI.
        // For now, let's assume the model name is visible.
        await expect(page.locator('button:has-text("Model")')).toHaveText(/claude-3-opus/); // replace with actual model
    });
});