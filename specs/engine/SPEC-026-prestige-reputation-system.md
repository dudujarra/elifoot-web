# SPEC-026: Prestige & Reputation System

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/PrestigeSystem.js`  
**Linhas**: ~220

---

## O que é

Sistema de prestígio time + jogador. Ranking intl, histórico títulos, influencia scout/transfer value.

---

## Prestige Sources

| Fonte | Pontos | Duração | Max acumulado |
|-------|--------|---------|---|
| Título Campeonato | +50 | Permanent | — |
| Copa regional | +30 | Permanent | — |
| Taça intl (ex: Libertadores) | +100 | Permanent | — |
| Final intl | +25 | 10 years (decay) | — |
| Série de vitórias (5+) | +5/week | While active | — |
| Promoted (ascensão) | +10 | 2 years | — |
| Contratação star | +2 | 1 year | — |
| Treinador famoso | +1 | 1 year | — |
| Bad season (-10 liga) | -20 | Permanent | — |
| Relegation | -50 | Permanent | — |

---

## Prestige Tiers

| Tier | Range | Bonus scouting | Transfer % | Salaries - |
|------|-------|---|---|---|
| Local | 0-50 | -20% players | -15% | +10% |
| Regional | 51-150 | -10% | -10% | +5% |
| Nacional | 151-300 | Normal | Normal | Normal |
| Intl (TOP 100) | 301-500 | +10% | +5% | -5% |
| Elite (TOP 50) | 501-1000 | +20% | +15% | -10% |
| Legendary (TOP 10) | 1001+ | +50% | +25% | -20% |

---

## Input

```typescript
PrestigeSystem.addPrestige({
  teamId: number,
  source: string,
  points: number,
  year: number
})

PrestigeSystem.calculateTransferValue({
  playerId: number,
  teamId: number  // buying team
})

PrestigeSystem.getTeamRanking({
  top: number (default 20)
})
```

---

## Output

```typescript
{
  teamId: number,
  prestige: number,
  tier: string,
  ranking: number,  // 1-infinite
  history: [
    { source: string, points: number, year: number }
  ],
  decayThisYear: number,
  transferModifier: number,
  scoutingModifier: number
}
```

---

## Validações

- [ ] Prestige nunca negativo
- [ ] Título = +50, Copa = +30, Taça intl = +100
- [ ] Decay 5% ao ano (old achievements lose weight)
- [ ] Ranking baseado em prestige atual (dinâmico)
- [ ] Transfer modifier: ±25% max
- [ ] Scouting modifier: ±50% max
- [ ] Tier atualizado automaticamente
- [ ] Prestige history imutável (auditoria)

---

## Forbidden

- [ ] Prestige negativo
- [ ] Duplicate source (mesmo título contado 2×)
- [ ] Decay > 5% por ano
- [ ] Transfer modifier > 25%
- [ ] Ranking com gap (ex: posições 1-5, depois 10)
- [ ] Prestige transfer entre times

---

## Testes

```javascript
test('Título Campeonato: +50 prestige', () => {
  const before = engine.getPrestige(teamId);
  engine.addPrestige(teamId, 'Título Campeonato', 50);
  const after = engine.getPrestige(teamId);
  
  expect(after - before).toBe(50);
});

test('Tier calc: Nacional 151-300', () => {
  engine.setPrestige(teamId, 200);
  const tier = engine.getTier(teamId);
  expect(tier).toBe('Nacional');
});

test('Transfer modifier: +15% p/ Elite', () => {
  engine.setPrestige(teamId, 600);  // Elite
  const mod = engine.getTransferModifier(teamId);
  expect(mod).toBe(1.15);  // +15%
});

test('Decay 5% ao ano', () => {
  engine.setPrestige(teamId, 100);
  engine.processYear();  // 1 year passes
  const prestige = engine.getPrestige(teamId);
  expect(prestige).toBe(95);  // 100 × 0.95
});

test('Ranking dinâmico', () => {
  engine.setPrestige(teamA, 500);
  engine.setPrestige(teamB, 400);
  engine.setPrestige(teamC, 500);
  
  const ranking = engine.getTeamRanking();
  expect(ranking[0].teamId).toBe(teamA || teamC);  // Tie
  expect(ranking[1].teamId).toBe(teamB);
});

test('Scouting +20% p/ Elite tier', () => {
  engine.setPrestige(teamId, 600);  // Elite
  const mod = engine.getScoutingModifier(teamId);
  expect(mod).toBe(1.2);  // +20%
});

test('Prestige history imutável', () => {
  const history1 = engine.getPrestigeHistory(teamId);
  engine.addPrestige(teamId, 'Título', 50);
  const history2 = engine.getPrestigeHistory(teamId);
  
  expect(history1.length).toBe(history2.length - 1);
  expect(history2[history2.length - 1].source).toBe('Título');
});
```

---

## Ranking Sample (Top 20)

```
1.  Manchester City (1200 pts) - Legendary
2.  Liverpool (1100 pts) - Legendary
3.  Real Madrid (1050 pts) - Legendary
4.  Barcelona (950 pts) - Elite
5.  Bayern Munich (900 pts) - Elite
...
20. Flamengo (450 pts) - Intl
```

---
