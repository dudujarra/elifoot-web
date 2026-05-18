import { test, expect } from '@playwright/test';

test.describe('Coach Proposal Flow', () => {
  test('should handle resignation and job offers', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    await page.getByRole('button', { name: /Demissão|Pedir Demissão/i }).click();
    
    await expect(page.getByText(/Ofertas|Propostas/i).first()).toBeVisible();
  });
});
