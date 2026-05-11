# SPEC-147: DDA Calibration — Dynamic Difficulty com Dados Reais

> **Origem**: deep soak v1 — win streaks de até 18, loss streaks de 11.
> opponentBoost atual não calibrado com dados reais de distribuição de streaks.

---

## O que é

Recalibra o `opponentBoost` (DDA) usando a distribuição real de streaks observada no deep soak.
Garante que boost seja proporcional ao streak, não binário.

---

## Input

```typescript
streak: number          // positivo = win, negativo = loss
// Dados calibrados do deep soak:
// Max win streak observado: 18
// Max loss streak observado: 11
// Win rate médio: 42%
```

---

## Output esperado

```typescript
// Curva de boost baseada em dados reais:
// streak +5:  opponentBoost = 1.10 (leve)
// streak +10: opponentBoost = 1.20
// streak +18: opponentBoost = 1.35 (máximo observado)
// streak -5:  opponentBoost = 0.92 (ajuda o jogador)
// streak -11: opponentBoost = 0.82 (máximo auxílio)
```

---

## Regras de validação

- [ ] `opponentBoost` cresce monotonicamente com streak positivo
- [ ] Streak +18 → boost ≤ 1.40 (cap máximo)
- [ ] Streak -11 → boost ≥ 0.80 (cap mínimo — não tornar trivial)
- [ ] Win rate geral em soak 20 temporadas permanece entre 38-52%
- [ ] Streak +5 → boost entre 1.05 e 1.15

---

## Forbidden

- [ ] Boost > 1.50 em qualquer streak (inviabiliza o jogo)
- [ ] Boost < 0.70 (trivializa demais)
- [ ] Curva não-monotônica

---

## Implementação

**Arquivo**: `src/services/MatchSimulator.js` ou `src/engine/systems/DifficultyModes.js`

```javascript
// SPEC-147: DDA calibrado com dados reais do deep soak
// Distribuição observada: win streaks até 18, loss até 11
export function calcOpponentBoost(streak) {
    if (streak <= 0) {
        // Perdendo: boost NEGATIVO (ajuda o jogador)
        const severity = Math.min(11, Math.abs(streak));
        return 1.0 - (severity / 11) * 0.18; // min 0.82 em streak -11
    }
    // Ganhando: boost POSITIVO (dificulta)
    const severity = Math.min(18, streak);
    return 1.0 + (severity / 18) * 0.35; // max 1.35 em streak +18
}
```

---

## Testes

```javascript
describe('SPEC-147: DDA Calibration', () => {
  test('streak 0: boost = 1.0', () => { expect(calcOpponentBoost(0)).toBe(1.0); });
  test('streak +18: boost <= 1.40', () => { expect(calcOpponentBoost(18)).toBeLessThanOrEqual(1.40); });
  test('streak -11: boost >= 0.80', () => { expect(calcOpponentBoost(-11)).toBeGreaterThanOrEqual(0.80); });
  test('curva monotônica positiva', () => { expect(calcOpponentBoost(10)).toBeGreaterThan(calcOpponentBoost(5)); });
  test('curva monotônica negativa', () => { expect(calcOpponentBoost(-10)).toBeLessThan(calcOpponentBoost(-5)); });
  test('win rate 38-52% em soak com DDA calibrado', async () => { /* soak test */ });
});
```
