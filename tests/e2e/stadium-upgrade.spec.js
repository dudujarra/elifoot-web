import { test, expect } from '@playwright/test';

test.describe('Stadium Upgrade Flow', () => {
  test('should display stadium info and upgrade options', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    await page.getByRole('button', { name: /Estádio/i }).click();
    
    await expect(page.getByText(/Capacidade|Nível/i).first()).toBeVisible();
  });
});
