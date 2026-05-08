# SPEC-014: Season & Tournament System

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/SeasonSystem.js`, `src/engine/TournamentSystem.js`  
**Linhas**: ~300

---

## O que é

Gerencia competições (Campeonato, Copa, Taça). Cada temporada tem estrutura diferente. Pontos/colocação por competition.

---

## 3 Competition Types

| Tipo | Duração | Estrutura | Rounds | Prêmio campeão |
|------|---------|-----------|--------|---|
| Campeonato | 38 weeks | Round-robin (2 turnos) | 76 matches | R$10M + troféu |
| Copa | 10 weeks | Mata-mata | 4 rounds (32→16→8→4) | R$5M + troféu |
| Taça | 20 weeks | Grupos + mata | 3 fases | R$3M + troféu |

---

## Season Input

```typescript
SeasonSystem.initSeason({
  year: number (2026+),
  competitions: array of { type, startWeek }
})

SeasonSystem.processRound({
  teamId: number,
  competitionId: string,
  weekOfYear: number
})
```

---

## Season Output

```typescript
{
  year: number,
  competitions: [
    {
      id: string,
      type: 'Campeonato' | 'Copa' | 'Taça',
      startWeek: number,
      endWeek: number,
      status: 'active' | 'finished' | 'not_started',
      standings: [
        {
          teamId: number,
          position: number,
          wins: number,
          draws: number,
          losses: number,
          points: number,
          goalsFor: number,
          goalsAgainst: number,
          goalDiff: number
        }
      ],
      champion: number | null
    }
  ]
}
```

---

## Validações

- [ ] Campeonato: 76 matches (38 weeks × 2 times), 38 times
- [ ] Copa: 31 matches total (mata-mata 4 rounds)
- [ ] Taça: 24 matches (3 grupos de 8 times)
- [ ] Pontuação: W=3, D=1, L=0
- [ ] Tiebreaker: pts > gd > gf
- [ ] Cada time joga 1× por semana máx (por competição)
- [ ] Vencedor determinado automaticamente ao fim
- [ ] Prêmio recebido na week final

---

## Forbidden

- [ ] Time jogar 2× mesma semana (mesma competition)
- [ ] Campeonato com < 38 times
- [ ] Copa com não-potência-2 times (ex: 33)
- [ ] Prêmio negativo
- [ ] Season overlap (2 Campeonatos simultâneos)

---

## Testes

```javascript
test('Campeonato: 76 matches em 38 weeks', () => {
  const season = engine.initSeason({ year: 2026 });
  const matches = engine.getMatchCount(season.competitions[0]);
  expect(matches).toBe(76);
});

test('Standings: W=3, D=1, L=0', () => {
  engine.processMatch({ result: 'win' });
  const pts = engine.getStandings()[0].points;
  expect(pts).toBe(3);
});

test('Tiebreaker: gd > gf', () => {
  // Time A: 3 wins (9 pts), GD +5
  // Time B: 3 wins (9 pts), GD +2
  const standings = engine.getStandings();
  expect(standings[0].teamId).toBe(teamA);  // GD maior
});

test('Copa mata-mata: 31 matches', () => {
  const copa = engine.initCompetition('Copa', { teams: 32 });
  const totalMatches = engine.getTotalMatches(copa);
  expect(totalMatches).toBe(31);  // 16+8+4+2+1
});

test('Champion recebe prêmio', () => {
  const before = engine.getMoney();
  engine.finishSeason();  // Assume team ganhou
  const after = engine.getMoney();
  expect(after - before).toBe(10000000);  // R$10M Campeonato
});
```

---
