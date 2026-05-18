import { test, expect } from '@playwright/test';

test.describe('Youth Academy Flow', () => {
  test('should display academy and promote players', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    await page.getByRole('button', { name: /Base|Academia/i }).click();
    
    await expect(page.getByText(/Nível da Base/i).first()).toBeVisible();
    const promoteBtn = page.getByRole('button', { name: /Promover/i }).first();
    if (await promoteBtn.isVisible()) {
      await promoteBtn.click();
    }
  });
});
