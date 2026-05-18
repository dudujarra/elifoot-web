import { test, expect } from '@playwright/test';

test.describe('Staff Management Flow', () => {
  test('should allow hiring and firing staff', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    await page.getByRole('button', { name: /Staff|Comissão/i }).click();
    
    await expect(page.getByText(/Contratar|Fisioterapeuta/i).first()).toBeVisible();
  });
});
