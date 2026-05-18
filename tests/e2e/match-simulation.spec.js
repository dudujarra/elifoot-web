import { test, expect } from '@playwright/test';

test.describe('Match Simulation Flow', () => {
  test('should advance to match day and complete simulation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Iniciar Jogo/i }).click();
    await page.getByText('Brasil', { exact: true }).click();
    await page.getByRole('button', { name: /Assumir Clube/i }).first().click();

    // Avanca semana até jogo
    const btn = page.getByRole('button', { name: /Avançar|Jogar/i });
    await btn.click();
    
    // Confirma que a tela de resultado ou partidas apareceu
    await expect(page.getByText(/Gols|Resultado|Placar/i).first()).toBeVisible({ timeout: 10000 });
  });
});
