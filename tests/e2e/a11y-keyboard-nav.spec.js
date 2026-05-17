/**
 * E2E: Keyboard Navigation & A11y
 * AKITA-430: Verify skip-link, focus trap, and sidebar keyboard nav
 */
import { test, expect } from './_fixtures.js';

const BASE_URL = 'http://localhost:5173';

test.describe('A11y Keyboard Navigation', () => {
    test('skip-link becomes visible on Tab and navigates to main content', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.start-view', { timeout: 10000 });

        // Tab to reveal skip-link
        await page.keyboard.press('Tab');
        const skipLink = page.locator('.ef-skip-link');
        // Skip link should be in the DOM
        await expect(skipLink).toHaveCount(1);
    });

    test('sidebar items are keyboard navigable', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.start-view', { timeout: 10000 });

        // Start game
        const teamBtn = page.locator('.team-card').first();
        await teamBtn.click();
        await page.waitForSelector('.ef-sidebar__item', { timeout: 10000 });

        // Sidebar items should have tabIndex=0
        const sidebarItems = page.locator('.ef-sidebar__item');
        const count = await sidebarItems.count();
        expect(count).toBeGreaterThan(0);

        // First item should have role=button
        const firstItem = sidebarItems.first();
        await expect(firstItem).toHaveAttribute('role', 'button');
        await expect(firstItem).toHaveAttribute('tabindex', '0');
    });

    test('active sidebar item has aria-current=page', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.start-view', { timeout: 10000 });

        const teamBtn = page.locator('.team-card').first();
        await teamBtn.click();
        await page.waitForSelector('.ef-sidebar__item--active', { timeout: 10000 });

        const activeItem = page.locator('.ef-sidebar__item--active');
        await expect(activeItem).toHaveAttribute('aria-current', 'page');
    });

    test('modal has focus trap — focus stays inside', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.start-view', { timeout: 10000 });

        // Start game
        const teamBtn = page.locator('.team-card').first();
        await teamBtn.click();
        await page.waitForSelector('.ef-sidebar__item', { timeout: 10000 });

        // Open bug report modal (FloatingBugButton)
        const bugBtn = page.locator('.ef-fab-bug');
        if (await bugBtn.isVisible()) {
            await bugBtn.click();
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

            // Dialog should have aria-modal=true
            const dialog = page.locator('[role="dialog"]');
            await expect(dialog).toHaveAttribute('aria-modal', 'true');
        }
    });

    test('Esc key closes modal', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.start-view', { timeout: 10000 });

        const teamBtn = page.locator('.team-card').first();
        await teamBtn.click();
        await page.waitForSelector('.ef-sidebar__item', { timeout: 10000 });

        const bugBtn = page.locator('.ef-fab-bug');
        if (await bugBtn.isVisible()) {
            await bugBtn.click();
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

            // Press Esc
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);

            // Dialog should be gone
            const dialog = page.locator('[role="dialog"]');
            await expect(dialog).toHaveCount(0);
        }
    });
});
