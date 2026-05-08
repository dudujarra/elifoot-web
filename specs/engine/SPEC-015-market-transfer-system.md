# SPEC-015: Market & Transfer System

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/MarketSystem.js`, `src/engine/TransferWindow.js`  
**Linhas**: ~300

---

## O que é

Mercado de transferências. 2 janelas/ano (verão 8 weeks, inverno 4 weeks). Venda/compra de players com oferta/contraoferta.

---

## Transfer Window Calendar

| Período | Semanas | Aberto |
|---------|---------|--------|
| Verão | Week 1-8 | Compra + Venda |
| Fora de janela | Week 9-35 | Apenas pré-acordos |
| Inverno | Week 36-39 | Compra + Venda (limitado) |
| Fora de janela | Week 40-52 | Apenas pré-acordos |

---

## Preço Transfer

```
Base = Player OVR × Idade factor × Contract years remaining
Demand multiplier = (Offers - 1) × 0.05

Final price = Base × (1 + demand) × Team prestige
```

---

## Input

```typescript
MarketSystem.listPlayer({
  playerId: number,
  askingPrice: number,
  weekOfYear: number
})

MarketSystem.makeOffer({
  playerId: number,
  offeringTeamId: number,
  bidAmount: number,
  duration: number (weeks to accept)
})

MarketSystem.acceptOffer({
  playerId: number,
  offeringTeamId: number,
  offerPrice: number
})

MarketSystem.negotiateCounterOffer({
  playerId: number,
  counterPrice: number
})
```

---

## Output

```typescript
// listPlayer
{
  playerId: number,
  sellingTeamId: number,
  listed: boolean,
  askingPrice: number,
  weekListed: number,
  bids: [
    {
      teamId: number,
      amount: number,
      weekOffered: number,
      accepted: boolean | 'counter'
    }
  ]
}

// acceptOffer
{
  playerId: number,
  fromTeamId: number,
  toTeamId: number,
  transferPrice: number,
  weekCompleted: number,
  playerTransferred: boolean
}
```

---

## Validações

- [ ] Lista apenas em janela aberta (W1-8, W36-39)
- [ ] Pré-acordo (oferta) permitido fora de janela
- [ ] Múltiplas ofertas simultâneas permitidas
- [ ] Contraoferta reduz ou mantém preço (não sobe)
- [ ] Aceitação conclui transferência imediatamente
- [ ] Money debitado do time comprador
- [ ] Contract reset (novo contrato para anos restantes)
- [ ] Contraoferta válida por 1 week

---

## Forbidden

- [ ] Transferência fora de janela (sem pré-acordo)
- [ ] Oferta < 50% do askingPrice
- [ ] Vender player sem contrato
- [ ] Team sem money não compra (rejeitada)
- [ ] Contraoferta > preço anterior

---

## Testes

```javascript
test('Lista jogador apenas em janela verão (W1-8)', () => {
  const listed = engine.listPlayer(playerId, { weekOfYear: 5 });
  expect(listed.listed).toBe(true);
  
  const offSeason = engine.listPlayer(playerId, { weekOfYear: 20 });
  expect(offSeason.listed).toBe(false);
});

test('Oferta fora de janela (pré-acordo)', () => {
  const preAgreement = engine.makeOffer(playerId, { weekOfYear: 20 });
  expect(preAgreement.pending).toBe(true);
  expect(preAgreement.activateWeek).toBe(1);  // Ativa na janela
});

test('Preço = OVR × age factor × years × prestige', () => {
  // OVR 80, age 27, 3 years, prestige 1.2, demand 0
  const basePrice = 80 * 1.0 * 3 * 1.2;  // 288
  const finalPrice = engine.calculateTransferPrice(playerId);
  expect(finalPrice).toBe(288);  // Simplificado, valores reais maiores
});

test('Múltiplas ofertas criam demand multiplier', () => {
  engine.makeOffer(playerId, 500, { fromTeam: 1 });
  engine.makeOffer(playerId, 600, { fromTeam: 2 });
  const price = engine.calculateDemandPrice(playerId);
  // (2 ofertas - 1) × 0.05 = 0.05 (5% markup)
  expect(price).toBeGreaterThan(500);
});

test('Contraoferta não sobe preço', () => {
  const initial = engine.makeOffer(playerId, 1000);
  const counter = engine.negotiateCounterOffer(playerId, 1500);
  expect(counter.price).toBeLessThanOrEqual(1000);
});

test('Aceitação transfere player + money', () => {
  const beforeMoney = engine.getMoney(toTeamId);
  const beforeRoster = engine.getRoster(toTeamId).length;
  
  engine.acceptOffer(playerId, toTeamId, 800);
  
  const afterMoney = engine.getMoney(toTeamId);
  const afterRoster = engine.getRoster(toTeamId).length;
  
  expect(afterMoney).toBe(beforeMoney - 800);
  expect(afterRoster).toBe(beforeRoster + 1);
});
```

---
