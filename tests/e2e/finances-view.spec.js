import { test, expect } from '@playwright/test';

test.describe('Finances View Flow', () => {
  test('should display balance and allow bank loans', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    await page.getByRole('button', { name: /Finanças|Banco/i }).click();
    
    await expect(page.getByText(/Saldo/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Pegar Empréstimo/i }).first()).toBeVisible();
  });
});
