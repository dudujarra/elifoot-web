# SPEC-148: xG Cap — Reduzir Goleadas Absurdas

> **Origem**: deep soak v1 — VEXAMEs de 0-7, 0-8, 1-7 persistentes após OVR calibration (SPEC-142).
> MAX_COMBINED_GOALS=8 e xG cap atual ainda permitem placares irrealistas.

---

## O que é

Ajusta limites do modelo Dixon-Coles para reduzir frequência de goleadas pesadas.
Reduz MAX_COMBINED_GOALS e ajusta cap de lambda/mu.

---

## Input

```typescript
// Parâmetros atuais:
MAX_COMBINED_GOALS: 8
lambda: Math.max(0.1, Math.min(lambda, 5.0))  // xG home
mu:     Math.max(0.1, Math.min(mu, 5.0))      // xG away
```

---

## Output esperado

```typescript
// Pós-fix:
MAX_COMBINED_GOALS: 6        // máx 6 gols combinados (era 8)
lambda: Math.min(lambda, 3.5) // cap mais baixo
mu:     Math.min(mu, 3.5)
// Distribuição esperada de placares:
// 0-0: ~8%, 1-0: ~18%, 1-1: ~14%, 2-1: ~16%, 2-0: ~12%
// Placar ≥ 5-0: < 3% das partidas (era ~8%)
```

---

## Regras de validação

- [ ] VEXAME (diff ≥ 4) < 2% das partidas em soak 20 temporadas (era ~4%)
- [ ] Placar máximo em soak ≤ 6-0 ou 5-1 (era 0-8)
- [ ] Média de gols por partida entre 2.0-3.5 (realista)
- [ ] Win rate não muda mais que ±3%

---

## Forbidden

- [ ] Placar 0-8 ou 8-0 possível após fix
- [ ] Média de gols/partida < 1.5 (sem gols = sem diversão)
- [ ] VEXAME desaparecer completamente (goleadas existem, só menos frequentes)

---

## Implementação

**Arquivo**: `src/services/MatchSimulator.js`

```javascript
// ANTES:
const MAX_COMBINED_GOALS = 8;
lambda = Math.max(0.1, Math.min(lambda, 5.0));
mu     = Math.max(0.1, Math.min(mu,     5.0));

// DEPOIS (SPEC-148):
const MAX_COMBINED_GOALS = 6;
lambda = Math.max(0.1, Math.min(lambda, 3.5));
mu     = Math.max(0.1, Math.min(mu,     3.5));
```

---

## Testes

```javascript
describe('SPEC-148: xG Cap', () => {
  test('MAX_COMBINED_GOALS = 6', () => { /* const value */ });
  test('lambda capped at 3.5', () => { /* Math.min */ });
  test('1000 partidas: nenhuma 0-8 ou 8-0', async () => { /* max score */ });
  test('média gols/partida entre 2.0-3.5', async () => { /* average */ });
  test('VEXAME < 2% das partidas', async () => { /* frequency */ });
  test('win rate muda < 3%', async () => { /* delta */ });
});
```
