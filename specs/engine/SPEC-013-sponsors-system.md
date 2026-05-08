# SPEC-013: Sponsors System (Patrocínio)

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/SponsorsSystem.js`  
**Linhas**: ~220

---

## O que é

Sistema de patrocínio. Time assina contratos com 3 empresas máx. Cada sponsor paga receita semanal + bonus por performance.

---

## 5 Sponsor Tiers

| Tier | Nome | Base/week | Win bonus | Champion bonus | Duration | Max contracts |
|------|------|-----------|-----------|---|----------|---|
| 1 | Local | R$50K | +R$5K | +R$20K | 52 weeks | 3 |
| 2 | Regional | R$100K | +R$10K | +R$40K | 52 weeks | 3 |
| 3 | Nacional | R$200K | +R$20K | +R$80K | 52 weeks | 3 |
| 4 | Multinacional | R$500K | +R$50K | +R$200K | 52 weeks | 2 |
| 5 | Global | R$1M | +R$100K | +R$400K | 52 weeks | 1 |

---

## Input

```typescript
SponsorsSystem.signContract({
  teamId: number,
  sponsorTier: 1 | 2 | 3 | 4 | 5,
  duration: number (weeks, 1-52),
  weekly_base: number,
  weekOfYear: number
})

SponsorsSystem.processWeekly({
  teamId: number,
  wins: number,
  losses: number,
  champion: boolean,
  weekOfYear: number
})
```

---

## Output

```typescript
// signContract
{
  id: string,
  tier: 1-5,
  weekStart: number,
  weekEnd: number,
  weeklyRevenue: number,
  active: boolean,
  name: string (gerado)
}

// processWeekly
{
  contractId: string,
  weeklyPayout: number,  // base + bonuses
  breakdown: {
    base: number,
    winBonus: number,
    championBonus: number
  },
  active: boolean
}
```

---

## Validações

- [ ] Max 3 contracts ativo (Tier 1-3), max 2 (Tier 4), max 1 (Tier 5)
- [ ] Contratos não se sobrepõem (mesmo sponsor)
- [ ] Receita semanal = base + (wins × win_bonus) + (champion × champion_bonus)
- [ ] Duração entre 1-52 weeks
- [ ] Cancelamento manual gratuito (antes terminar)
- [ ] Sponsor expira automaticamente (duration esgota)
- [ ] Tier determina payout (T1 < T5)

---

## Forbidden

- [ ] Mais de max contracts por tier
- [ ] Duração > 52 weeks
- [ ] Weekly base = 0
- [ ] Sponsor ativo duas vezes (ID duplicado)
- [ ] Negative payout

---

## Testes

```javascript
test('Tier 5: max 1 contract ativo', () => {
  const c1 = engine.signSponsor('Global', { duration: 52 });
  const c2 = engine.signSponsor('Global', { duration: 52 });
  expect(c2).toBe(null);  // Rejeitado, max 1
});

test('Weekly payout = base + bonuses', () => {
  engine.signSponsor('Regional', { weeklyBase: 100000 });
  const payout = engine.processWeekly({ wins: 2, champion: false });
  // 100K (base) + 20K (2 wins) = 120K
  expect(payout.weeklyPayout).toBe(120000);
});

test('Champion bonus ativado', () => {
  engine.signSponsor('Nacional', { weeklyBase: 200000 });
  const payout = engine.processWeekly({ wins: 0, champion: true });
  // 200K (base) + 80K (champion) = 280K
  expect(payout.weeklyPayout).toBe(280000);
});

test('Duração máxima 52 weeks', () => {
  const contract = engine.signSponsor('Local', { duration: 53 });
  expect(contract).toBe(null);  // Rejeitado
});

test('Sponsor expira após duration', () => {
  const c = engine.signSponsor('Local', { duration: 10, weekStart: 1 });
  // Semana 11: deve estar inativo
  expect(engine.isSponsorActive(c.id, 11)).toBe(false);
});
```

---
