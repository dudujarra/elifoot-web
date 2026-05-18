import { test, expect } from '@playwright/test';

test.describe('Achievements View', () => {
  test('should display unlocked and locked achievements', async ({ page }) => {
    // Navigate and Start Game
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();

    // Select Team
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    // Navigate to Achievements (Hall of Fame / Conquistas)
    await page.getByRole('button', { name: /Conquistas|Hall/i }).click();

    // Check modal or view
    const achievementsHeader = page.getByRole('heading', { name: /Conquistas|Troféus/i });
    await expect(achievementsHeader).toBeVisible();

    // Verify some generic achievement structure is present
    await expect(page.locator('.achievement-card, .trophy-item').first()).toBeVisible();
  });
});
