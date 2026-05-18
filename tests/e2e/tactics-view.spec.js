import { test, expect } from '@playwright/test';

test.describe('Tactics View Flow', () => {
  test('should allow changing team formation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    await page.getByRole('button', { name: /Táticas|Esquema/i }).click();
    
    const formationSelect = page.locator('select').first();
    await expect(formationSelect).toBeVisible();
    await formationSelect.selectOption({ label: '4-3-3' });
    
    await expect(page.getByText('4-3-3').first()).toBeVisible();
  });
});
