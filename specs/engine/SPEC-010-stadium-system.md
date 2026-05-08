# SPEC-010: Stadium System

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/StadiumSystem.js`  
**Linhas**: ~220

---

## O que é

5 níveis stadium: capacidade, preço ingresso, revenue VIP. Upgrade custa dinheiro progressivo.

---

## Níveis

| Nível | Nome | Capacidade | VIP | Ingresso | Upgrade cost |
|---|---|---|---|---|---|
| 1 | Municipal | 5K | 100 | R$20 | — |
| 2 | Regional | 15K | 500 | R$30 | R$10M |
| 3 | Moderno | 35K | 2K | R$40 | R$40M |
| 4 | Premium | 55K | 5K | R$55 | R$100M |
| 5 | Templo | 80K | 10K | R$70 | R$250M |

---

## Validações

- [ ] Revenue = occupancy × capacity × ticket price
- [ ] VIP revenue = 3× ticket price
- [ ] Upgrade costs progression correta
- [ ] Nível 1 padrão

---

## Testes

```javascript
test('Level 5: 80K capacity, VIP 10K', () => {
  const stadium = StadiumSystem.getStadium(5);
  expect(stadium.capacity).toBe(80000);
  expect(stadium.vip).toBe(10000);
});

test('Revenue = capacity × occupancy × price', () => {
  const stadium = StadiumSystem.getStadium(3);
  const revenue = StadiumSystem.calculateRevenue(stadium, 0.85);
  expect(revenue).toBe(35000 × 0.85 × 40);
});
```
