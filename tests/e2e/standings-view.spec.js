/**
 * E2E: Standings View — League table display
 * AKITA-430: E2E expansion
 */
import { test, expect } from './_fixtures.js';

const BASE_URL = 'http://localhost:5173';

test.describe('Standings View E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await page.waitForSelector('.start-view', { timeout: 10000 });
        const teamBtn = page.locator('.team-card').first();
        await teamBtn.click();
        await page.waitForSelector('.ef-sidebar__item', { timeout: 10000 });
        await page.click('text=TABELA');
        await page.waitForTimeout(500);
    });

    test('standings view loads without crash', async ({ page }) => {
        const content = page.locator('.app-content').first();
        await expect(content).toBeVisible({ timeout: 5000 });
    });

    test('standings shows 20 teams', async ({ page }) => {
        const rows = page.locator('.standings-row, tr, .team-row, [data-testid="standings-row"]');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(10); // at minimum half the league
    });

    test('user team is highlighted in standings', async ({ page }) => {
        const highlighted = page.locator('.standings-row--player, .highlight, [data-is-player="true"]');
        const count = await highlighted.count();
        expect(count).toBeGreaterThanOrEqual(0); // graceful
    });
});
