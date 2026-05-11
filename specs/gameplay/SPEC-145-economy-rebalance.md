# SPEC-145: Economy Rebalance — Salários vs Receitas

> **Origem**: deep soak v1 — salários R$76.8M + staff R$27M = R$103.8M/mês vs receitas R$124.5M/mês.
> Margem de só R$20M. Patrocínio instável → colapso financeiro após 50+ temporadas.

---

## O que é

Rebalanceia a economia para garantir que um clube típico tenha margem saudável (30-40% de receitas).
Ajusta folha salarial gerada + patrocínios base.

---

## Input

```typescript
// Parâmetros de balanceamento:
team.division: 1 | 2 | 3 | 4
team.squad[].salary: number  // calculado por data.js
```

---

## Output esperado

Após rebalanceamento:
- Margem mínima: 25% das receitas totais em divisão 1
- Folha salarial ≤ 40% das receitas em divisão 1
- Time não entra em saldo negativo antes de 30 temporadas sem gestão
- `SPEC-109 Economy Flow` ≥ 95/100

---

## Regras de validação

- [ ] `team.balance` > 0 após 30 temporadas sem gestão ativa
- [ ] Folha salarial / receitas_totais ≤ 0.40 em divisão 1
- [ ] Patrocínio base cobre pelo menos 50% da folha em qualquer divisão
- [ ] Saldo nunca cai abaixo de -R$10M em run de 20 temporadas sem intervenção
- [ ] SPEC-109 score ≥ 95 na telemetria

---

## Forbidden

- [ ] Folha salarial > 60% das receitas em qualquer divisão
- [ ] Saldo inicial negativo
- [ ] Patrocínio = 0 sem substituto

---

## Implementação

**Arquivo 1**: `src/engine/data.js` — reduzir fórmula de salário

```javascript
// ANTES: salary = Math.max(2000, Math.floor((ovr * ovr) * 5 + ...))
// OVR70: 70² × 5 = 24500/semana = ~980k/mês por jogador — muito alto

// DEPOIS: escalar por divisão
const baseSalary = Math.max(500, Math.floor((ovr * ovr) * 1.5));
// OVR70: 70² × 1.5 = 7350/semana = ~294k/mês — mais razoável
```

**Arquivo 2**: `src/engine/SponsorSystem.js` (ou equivalente) — aumentar patrocínio base

```javascript
// Garantir que patrocínio cobre ~60% da folha esperada por divisão
const sponsorBase = {
    1: 5_000_000,  // R$5M/semana para Série A
    2: 2_500_000,
    3: 1_000_000,
    4:   400_000,
};
```

---

## Testes

```javascript
describe('SPEC-145: Economy Rebalance', () => {
  test('Série A: folha/receitas <= 0.40', () => { /* ratio */ });
  test('saldo positivo após 30 temporadas sem gestão', async () => { /* > 0 */ });
  test('patrocínio >= 50% da folha', () => { /* ratio */ });
  test('saldo nunca abaixo de -10M em 20 seasons', async () => { /* min > -10M */ });
  test('salário OVR70 reduzido vs antes', () => { /* < 24500 */ });
});
```
