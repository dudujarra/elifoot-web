# SPEC-019: NPC AI & Team Behavior System

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/NPCAISystem.js`, `src/engine/TeamDecisions.js`  
**Linhas**: ~350

---

## O que é

Sistema de IA para times NPC. Decisões automáticas: transfers, staff, tactics, friendlies. Comportamento emergente baseado em goals+resources.

---

## NPC Team Goals (Priority 0-10)

| Goal | Trigger | Action |
|------|---------|--------|
| Promoção | Ranking 3º-5º (3+ seasons) | Buy strikers, scouts |
| Título (season) | Ranking 1º-2º | Buy best available |
| Sobrevivência | Ranking 18º+ | Sell stars, cut budget |
| CL qualification | Ranking 1º-4º | Buy midfielders |
| Renovation | Stadium aging | Upgrade stadium |
| Youth academy | No prospects | Hire academy director |

---

## NPC Decision Framework

```
NPC Decision = f(budget, goal priority, current ranking, last season result)

if (ranking < 5 AND goal == "title"):
  - Bid aggressively (90-110% market value)
  - Hire scouts / academy directors
  - Increase staff spending

if (ranking > 15 AND goal == "survival"):
  - Sell high-value players
  - Cut salaries 20-30%
  - Demote underperformers

if (stadium capacity < demand):
  - Queue upgrade (expensive)
  - Save budget for 3-5 seasons
```

---

## Input

```typescript
NPCAISystem.weeklyDecision({
  teamId: number,
  weekOfYear: number,
  gameWeek: number,  // dentro da temporada
  ranking: number,
  money: number,
  results: { wins, draws, losses }
})

NPCAISystem.seasonDecision({
  teamId: number,
  seasonYear: number,
  finalRanking: number,
  trophies: array,
  budget: number
})
```

---

## Output

```typescript
{
  teamId: number,
  weekOfYear: number,
  decisions: [
    {
      type: 'transfer_bid' | 'staff_hire' | 'staff_fire' | 'stadium_upgrade' | 'friendly_offer' | 'tactic_change',
      target: string,  // playerId | staffRole | stadiumLevel | friendlyOpponent
      priority: 1-10,
      executedWeek: number | null
    }
  ],
  reasoning: string
}
```

---

## Validações

- [ ] Goal change baseado em ranking (não aleatório)
- [ ] Transfer bids respeitam budget NPC
- [ ] Staff hires respeitam salary cap
- [ ] Tactic mudanças baseadas em resultados (3-week window)
- [ ] Friendly offers racionais (similar ranking)
- [ ] Stadium upgrade só se cash permita
- [ ] Decision reversível em 1 week (ex: demit staff)
- [ ] Comportamento deterministicamente reproduzível (seed)

---

## Forbidden

- [ ] NPC ultrapassar budget (exceto empréstimos)
- [ ] Contratar self (playerId mesmo que teamId)
- [ ] Stadium upgrade + major transfers mesma week
- [ ] Tactic change toda week (max 2× por season)
- [ ] Friendly oferta a rival (exceto amistoso)

---

## Testes

```javascript
test('Goal = title: bid 90-110% market value', () => {
  const npc = engine.getTeam('NPC_Team_1');  // Ranking 2º
  engine.setNPCGoal(npc, 'title');
  
  const market = engine.getMarketValue(playerId);
  const bid = engine.getNPCBid(npc, playerId);
  
  expect(bid).toBeGreaterThanOrEqual(market * 0.9);
  expect(bid).toBeLessThanOrEqual(market * 1.1);
});

test('Goal = survival: vende stars', () => {
  const npc = engine.getTeam('NPC_Team_Relegated');  // Ranking 20º
  engine.setNPCGoal(npc, 'survival');
  
  const decisions = engine.getWeeklyDecisions(npc, week);
  const sales = decisions.filter(d => d.type === 'transfer_bid');
  
  expect(sales.length).toBeGreaterThan(0);
});

test('Tactic change baseado em 3-week window', () => {
  const npc = engine.getTeam('NPC_Team_2');
  engine.setResults(npc, { week1: 'loss', week2: 'loss', week3: 'loss' });
  
  const decisions = engine.getWeeklyDecisions(npc, 4);
  const tacticChange = decisions.find(d => d.type === 'tactic_change');
  
  expect(tacticChange).toBeDefined();
});

test('Stadium upgrade só se cash permita', () => {
  const npc = engine.getTeam('NPC_Poor');  // R$5M
  const upgradeCost = 20000000;  // R$20M
  
  const decisions = engine.getSeasonDecisions(npc, 2026);
  const upgrade = decisions.find(d => d.type === 'stadium_upgrade');
  
  expect(upgrade).toBeUndefined();  // Não vai fazer
});

test('Staff hire respeta salary cap', () => {
  const npc = engine.getTeam('NPC_Team_3');
  const currentCap = engine.getSalaryCap(npc);
  const staffCost = engine.getStaffCost('Olheiro');
  
  // Salary cap = revenue × 0.6
  expect(currentCap).toBeGreaterThan(staffCost);
});

test('Friendly offer racional (ranking similar)', () => {
  const npc1 = engine.getTeam('NPC_1');  // Ranking 10º
  const npc2 = engine.getTeam('NPC_2');  // Ranking 20º
  
  const offers = engine.getNPCFriendlyOffers(npc1);
  const offer = offers[0];
  
  const diff = Math.abs(offer.targetRanking - 10);
  expect(diff).toBeLessThanOrEqual(5);  // ±5 positions
});

test('Deterministic behavior com seed', () => {
  engine.setSeed(12345);
  const decisions1 = engine.getSeasonDecisions(npc, 2026);
  
  engine.setSeed(12345);
  const decisions2 = engine.getSeasonDecisions(npc, 2026);
  
  expect(decisions1).toEqual(decisions2);  // Exatamente iguais
});
```

---

## NPC AI Behavior Tree

```
Root
├─ Evaluate current goal + ranking
├─ Check cash flow
├─ Decision branch:
│  ├─ Transfer market (active in window)
│  ├─ Staff management (weekly)
│  ├─ Stadium investment (seasonal)
│  ├─ Tactic adjustment (after 3-loss streak)
│  └─ Friendly schedule (off-season)
└─ Execute decision with priority queue
```

---
