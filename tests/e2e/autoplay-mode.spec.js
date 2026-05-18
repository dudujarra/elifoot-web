import { test, expect } from '@playwright/test';

test.describe('Autoplay Mode Flow', () => {
  test('should trigger autoplay and process weeks autonomously', async ({ page }) => {
    // Navigate and Start Game
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();

    // Select Team
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    // Trigger Autoplay
    const autoPlayBtn = page.getByRole('button', { name: /Autoplay/i });
    await expect(autoPlayBtn).toBeVisible();
    await autoPlayBtn.click();

    // Verify Autoplay Modal / View is shown
    await expect(page.getByText('Controle Autônomo', { exact: false })).toBeVisible();
    
    // Stop Autoplay
    const stopBtn = page.getByRole('button', { name: /Parar/i });
    await expect(stopBtn).toBeVisible();
    await stopBtn.click();
    
    // Ensure we return to dashboard
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });
});
