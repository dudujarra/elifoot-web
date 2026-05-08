# SPEC-016: Contracts & Salary System

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/ContractSystem.js`  
**Linhas**: ~250

---

## O que é

Gerencia contratos (duração, salário, bônus). Salary debitado semanal. Late payment causa stress/morale.

---

## Contract Types

| Tipo | Duração mín | Salário | Bônus |
|------|------|---------|-------|
| Novato | 1-2 years | R$10K-30K | Nenhum |
| Junior | 2-3 years | R$30K-100K | +R$5K/gol ou assists |
| Senior | 3-5 years | R$100K-500K | +R$10K/gol, bônus título |
| Veterano | 2-4 years | R$50K-300K | Reduzido |
| Lenda (rare) | 1-2 years | R$200K-1M | +R$50K/título |

---

## Input

```typescript
ContractSystem.offerContract({
  playerId: number,
  salary: number,
  duration: number (years),
  type: 'Novato' | 'Junior' | 'Senior' | 'Veterano' | 'Lenda',
  bonuses: {
    perGoal: number,
    perAssist: number,
    championBonus: number
  }
})

ContractSystem.payWeeklySalary({
  teamId: number,
  weekOfYear: number
})

ContractSystem.renewContract({
  playerId: number,
  newSalary: number,
  newDuration: number
})
```

---

## Output

```typescript
// offerContract
{
  contractId: string,
  playerId: number,
  salary: number,
  duration: number,
  startWeek: number,
  endWeek: number,
  bonuses: object,
  accepted: boolean
}

// payWeeklySalary
{
  teamId: number,
  weekOfYear: number,
  players: number,
  totalCost: number,
  paid: boolean,
  latePenalty: number
}
```

---

## Validações

- [ ] Salário entre min-max do tipo
- [ ] Duração entre 1-5 years
- [ ] Salary pago toda week (automático)
- [ ] Late payment: semana > 1 sem pagar = -5 stress/player
- [ ] Multiple late payments acumulam (não resetam)
- [ ] Bônus pagos ao atingir critério (gols, assists, título)
- [ ] Renovação reseta weeks (não acumula)
- [ ] Contrato findo = player free agent

---

## Forbidden

- [ ] Salary < 0
- [ ] Duration < 1 year ou > 5 years
- [ ] Salary fora do range do tipo
- [ ] Pagar bônus duplicado (1× por evento)
- [ ] Renovar contrato em contrato outro (exige final)

---

## Testes

```javascript
test('Junior contract: R$30K-100K', () => {
  const contract = engine.offerContract(playerId, {
    salary: 50000,
    type: 'Junior'
  });
  expect(contract.salary).toBeGreaterThanOrEqual(30000);
  expect(contract.salary).toBeLessThanOrEqual(100000);
});

test('Weekly salary debitado', () => {
  const before = engine.getMoney();
  engine.payWeeklySalary({ weekOfYear: 5 });
  const after = engine.getMoney();
  expect(before - after).toBe(totalSalary);
});

test('Late payment: stress +5/semana', () => {
  engine.skipWeek();
  engine.skipWeek();  // Não paga
  const stressBefore = engine.getPlayerStress(playerId);
  engine.payWeeklySalary();
  const stressAfter = engine.getPlayerStress(playerId);
  expect(stressAfter - stressBefore).toBe(10);  // 2 weeks × 5
});

test('Bônus gol pago 1×', () => {
  const bonus = engine.getContract(playerId).bonuses.perGoal;
  const before = engine.getMoney();
  engine.scoreGoal(playerId);
  engine.payWeeklyBonus();
  const after = engine.getMoney();
  expect(before - after).toBe(bonus);
  
  // 2º gol: não paga 2×
  engine.scoreGoal(playerId);
  const final = engine.getMoney();
  expect(final).toBe(after);  // Sem mudança
});

test('Renovação válida (contrato antigo findo)', () => {
  engine.finishContract(playerId);
  const newContract = engine.renewContract(playerId, { salary: 200000 });
  expect(newContract.accepted).toBe(true);
});

test('Contrato findo → player free agent', () => {
  engine.finishContract(playerId);
  const status = engine.getPlayer(playerId).status;
  expect(status).toBe('free_agent');
});
```

---
