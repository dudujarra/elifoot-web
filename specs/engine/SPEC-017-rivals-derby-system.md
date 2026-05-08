# SPEC-017: Rivals & Derby System

**Criticidade**: 🟢 MÉDIO  
**Módulo**: `src/engine/RivalrySystem.js`  
**Linhas**: ~180

---

## O que é

Sistema de rivalidades. Derbies têm regras especiais (intensidade +30%, emotion, red cards +50%).

---

## Rivalry Types

| Tipo | Bonus intensidade | Emotion boost | Red card chance | Rivalry points |
|------|---------|----------|---|---|
| Clássico | +40% | +50% | +60% | Winner +10 |
| Derby regional | +30% | +40% | +50% | Winner +5 |
| Histórico rival | +20% | +30% | +40% | Winner +3 |
| Novo rival | +10% | +20% | +20% | Winner +1 |

---

## Input

```typescript
RivalrySystem.addRival({
  teamA: number,
  teamB: number,
  type: 'Clássico' | 'Derby' | 'Histórico' | 'Novo',
  startWeek: number
})

RivalrySystem.processMatch({
  homeTeamId: number,
  awayTeamId: number,
  result: 'win' | 'draw' | 'loss',
  weekOfYear: number
})

RivalrySystem.getRivalryHistory({
  teamA: number,
  teamB: number
})
```

---

## Output

```typescript
{
  rivalryId: string,
  teamA: number,
  teamB: number,
  type: string,
  pointsA: number,
  pointsB: number,
  headToHead: number,  // wins A
  draws: number,
  startWeek: number,
  lastMatch: {
    week: number,
    result: string,
    scoreline: string,
    incidents: array
  }
}
```

---

## Validações

- [ ] Rivals criados simetricamente (A-B = B-A)
- [ ] Intensidade boost aplicado ao MatchEngine
- [ ] Red card +60% aplica a ambos times
- [ ] Emotion boost afeta decision-making IA
- [ ] Head-to-head rastreado (W/D/L)
- [ ] Rivalry points acumulam (nunca resetam)
- [ ] Derby match = +2 prestige ganhador

---

## Forbidden

- [ ] Mesmo time rivalizado (A vs A)
- [ ] Duplicação de rivalry (A-B + B-A = erro)
- [ ] Red card chance > 100%
- [ ] Rivalidade com intensidade < 10%
- [ ] Rivalry points negativos

---

## Testes

```javascript
test('Clássico: +40% intensidade', () => {
  engine.addRival(teamA, teamB, 'Clássico');
  const match = engine.simulateMatch(teamA, teamB);
  // Intensidade deve ser 40% maior que match normal
  expect(match.intensity).toBe(baseIntensity * 1.4);
});

test('Derby: red card +50%', () => {
  engine.addRival(teamA, teamB, 'Derby regional');
  const baseChance = 5;  // 5% normal
  const derbyChance = engine.calculateRedCardChance(teamA, teamB);
  expect(derbyChance).toBe(baseChance * 1.5);
});

test('Rivalry points acumulam', () => {
  engine.addRival(teamA, teamB, 'Histórico rival');
  engine.processRivalryMatch(teamA, teamB, 'win');  // +3 pts
  engine.processRivalryMatch(teamA, teamB, 'win');  // +3 pts
  const history = engine.getRivalryHistory(teamA, teamB);
  expect(history.pointsA).toBe(6);
});

test('Head-to-head rastreado', () => {
  engine.addRival(teamA, teamB, 'Novo rival');
  engine.processRivalryMatch(teamA, teamB, 'win');
  engine.processRivalryMatch(teamA, teamB, 'draw');
  engine.processRivalryMatch(teamA, teamB, 'loss');
  
  const history = engine.getRivalryHistory(teamA, teamB);
  expect(history.headToHead).toBe(1);  // A's wins
  expect(history.draws).toBe(1);
});

test('Derby ganhador +2 prestige', () => {
  engine.addRival(teamA, teamB, 'Derby regional');
  const prestigeBefore = engine.getTeam(teamA).prestige;
  engine.processRivalryMatch(teamA, teamB, 'win');
  const prestigeAfter = engine.getTeam(teamA).prestige;
  expect(prestigeAfter - prestigeBefore).toBe(2);
});

test('Simetria A-B = B-A', () => {
  engine.addRival(teamA, teamB, 'Clássico');
  const historyAB = engine.getRivalryHistory(teamA, teamB);
  const historyBA = engine.getRivalryHistory(teamB, teamA);
  expect(historyAB.rivalryId).toBe(historyBA.rivalryId);
});
```

---
