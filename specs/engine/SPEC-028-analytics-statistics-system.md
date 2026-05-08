# SPEC-028: Analytics & Statistics System

**Criticidade**: 🟢 MÉDIO  
**Módulo**: `src/engine/StatisticsSystem.js`, `src/ui/Analytics.jsx`  
**Linhas**: ~300

---

## O que é

Sistema de estatísticas. Dashboard com 50+ métricas (gols, defesa, possession, form).

---

## Player Statistics (Season)

| Métrica | Unit | Rastreado |
|---------|------|-----------|
| Matches | count | Automático |
| Goals | count | Automático |
| Assists | count | Automático |
| Yellow cards | count | Automático |
| Red cards | count | Automático |
| Tackle success | % | Automático |
| Pass completion | % | Automático |
| Possession % | % | Automático |
| Shots on target | count | Automático |
| Dribbles completed | count | Automático |
| Aerial duels won | count | Automático |
| Injury games missed | count | Automático |
| Morale avg | 0-100 | Automático |
| Stress avg | 0-100 | Automático |

---

## Team Statistics (Season)

| Métrica | Unit | Rastreado |
|---------|------|-----------|
| Wins | count | Automático |
| Draws | count | Automático |
| Losses | count | Automático |
| Goals for | count | Automático |
| Goals against | count | Automático |
| Goal difference | ± | Automático |
| Possession avg | % | Automático |
| Points | count | Automático |
| Ranking | 1-38 | Automático |
| Form (últimas 5) | string | Automático |
| Best player | playerId | Manual review |
| Top scorer | playerId | Automático |
| Clean sheets | count | Automático |
| Unbeaten run | count | Automático |

---

## Input

```typescript
StatisticsSystem.recordMatch({
  matchId: string,
  teams: [homeTeam, awayTeam],
  result: {
    homeGoals: number,
    awayGoals: number,
    events: array
  }
})

StatisticsSystem.getPlayerStats({
  playerId: number,
  season: number,
  position: string (optional)
})

StatisticsSystem.getTeamStats({
  teamId: number,
  season: number
})

StatisticsSystem.getComparison({
  playerId1: number,
  playerId2: number,
  metrics: array (default all)
})
```

---

## Output

```typescript
// Player stats
{
  playerId: number,
  season: number,
  stats: {
    matches: number,
    goals: number,
    assists: number,
    // ... all metrics
  },
  rank: {
    goalsRank: number,  // 1st, 2nd, etc
    assistsRank: number,
    etc
  },
  form: string,  // 'Excellent', 'Good', 'Average', 'Poor', 'Terrible'
  seasonGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
}

// Team stats
{
  teamId: number,
  season: number,
  standings: {
    ranking: number,
    points: number,
    wins: number,
    // ...
  },
  topScorer: { playerId, goals },
  form: string,
  projectedFinish: number
}
```

---

## Validações

- [ ] Stats não são manipuláveis (read-only após match)
- [ ] Rank baseado em performance real (não manual)
- [ ] Form calculado de últimas 5 matches (W/D/L)
- [ ] Season grade: A+ = >90 pts, F = <30 pts
- [ ] Projected finish usa remaining matches
- [ ] Top 10 lists em todas as competições
- [ ] Comparação jogador válida (mesma season)
- [ ] Stats limpas ao fim da temporada (archive)

---

## Forbidden

- [ ] Stats negativas
- [ ] Manipulação manual (cheating)
- [ ] Rank não correspondente a stats
- [ ] Form sem base em matches
- [ ] Season grade > A+ ou < F
- [ ] Comparison jogadores diferentes competição (sem normalizar)

---

## Testes

```javascript
test('Match recording atualiza stats', () => {
  const before = engine.getPlayerStats(playerId);
  engine.recordMatch(matchId, {
    homeGoals: 2,
    awayGoals: 1,
    scorers: [playerId, playerId, otherId]
  });
  const after = engine.getPlayerStats(playerId);
  
  expect(after.goals).toBe(before.goals + 2);
  expect(after.matches).toBe(before.matches + 1);
});

test('Top scorer atualizado', () => {
  const teamStats = engine.getTeamStats(teamId);
  const expectedTopScorer = engine.getPlayerStats(topScorerPlayerId);
  
  expect(teamStats.topScorer.playerId).toBe(topScorerPlayerId);
  expect(teamStats.topScorer.goals).toBe(expectedTopScorer.goals);
});

test('Form: última 5 matches', () => {
  engine.simulateMatches(5, [
    'win', 'win', 'draw', 'loss', 'win'  // W, W, D, L, W
  ]);
  const form = engine.getPlayerStats(playerId).form;
  
  expect(form).toMatch(/Good|Excellent/);  // 3W, 1D, 1L = Good
});

test('Season grade A+ = >90 pts', () => {
  engine.setTeamPoints(teamId, 95);
  const grade = engine.getTeamStats(teamId).seasonGrade;
  expect(grade).toBe('A+');
});

test('Comparison valida', () => {
  const comp = engine.getComparison(p1, p2);
  
  expect(comp).toHaveProperty('goals_diff');
  expect(comp).toHaveProperty('assists_diff');
  expect(comp).toHaveProperty('overall_comparison');
});

test('Projected finish calcula restante', () => {
  // 15 matches (57 pontos), 20 restantes
  // Taxa: 57/15 = 3.8 pts/match
  // Projected: 57 + (20 × 3.8) = 133 pts
  
  const projected = engine.getTeamStats(teamId).projectedFinish;
  expect(projected).toBeCloseTo(133, -5);
});

test('Stats limpas ao fim season', () => {
  const before = engine.getPlayerStats(playerId, 2026);
  engine.finishSeason(2026);
  const after = engine.getPlayerStats(playerId, 2026);
  
  expect(before).toEqual(after);  // Congelado (archive)
  
  const new2027 = engine.getPlayerStats(playerId, 2027);
  expect(new2027.matches).toBe(0);  // Reset
});
```

---

## Top 10 Lists

```
⚽ Top 10 Scorers (Nacional Championship)
1. Neymar Jr (FC Barcelona) - 28 gols
2. Vinicius Jr (Real Madrid) - 25 gols
...

🎯 Top 10 Assists (Nacional Championship)
1. Bruno Guimarães (Newcastle) - 15 assists
2. Rodrygo (Real Madrid) - 12 assists
...

🛡️ Top 10 Defenders (Tackle success %)
1. Thiago Silva (Flamengo) - 94.2%
2. Marquinhos (PSG) - 92.8%
...
```

---
