# SPEC-018: National Team System

**Criticidade**: 🟢 MÉDIO  
**Módulo**: `src/engine/NationalTeamSystem.js`  
**Linhas**: ~200

---

## O que é

Sistema de seleção. Players podem ser convocados para matches de seleção (friendlies, qualifiers). Ausência causa stress.

---

## National Team Matches

| Tipo | Frequência | Duração | Prêmio vitória | Lesão risk |
|------|---------|---------|---|---|
| Amistoso | 2× ano | 1 week | +Prestige intl | +10% |
| Qualificador | 4× ano (temporada) | 1 week | +Prestige intl | +15% |
| Copa intl | 1× 4 years | 4 weeks | +Prestige intl +R$1M | +20% |

---

## Input

```typescript
NationalTeamSystem.callupPlayer({
  playerId: number,
  countryId: string,
  matchType: 'Amistoso' | 'Qualificador' | 'Copa',
  dateWeek: number
})

NationalTeamSystem.processNationalMatch({
  countryId: string,
  result: 'win' | 'draw' | 'loss',
  weekOfYear: number,
  injuredPlayers: array of playerId
})

NationalTeamSystem.getPlayerStatus({
  playerId: number
})
```

---

## Output

```typescript
{
  playerId: number,
  countryId: string,
  status: 'called_up' | 'injured' | 'unavailable' | 'active',
  matchType: string,
  dateWeek: number,
  clubTeam: number,  // time de origem
  clubStatus: 'available' | 'on_duty'
}
```

---

## Validações

- [ ] Player convocado apenas p/ seleção do país dele
- [ ] Ausência por convocação = stress +10 (club não joga player)
- [ ] Lesão em match intl: recuperação normal + -2 weeks extra
- [ ] Player indisponível até fim do match intl
- [ ] Prestige intl somado ao club team
- [ ] Max 23 players por country squad
- [ ] Captain (maior OVR) designado automaticamente
- [ ] Friendly match: resultado não afeta standings

---

## Forbidden

- [ ] Convocar player outro país
- [ ] Match intl durante season (exceto datas FIFA)
- [ ] Player fora do squad (injured/banned)
- [ ] Stress negativo por convocação
- [ ] Match intl sobreescreve club match

---

## Testes

```javascript
test('Callup: player stress +10', () => {
  const stressBefore = engine.getPlayer(playerId).stress;
  engine.callupPlayer(playerId, 'BRA', 'Amistoso', 10);
  const stressAfter = engine.getPlayer(playerId).stress;
  expect(stressAfter - stressBefore).toBe(10);
});

test('Convocação apenas país próprio', () => {
  const player = engine.getPlayer(playerId);  // Assume BRA
  const callup = engine.callupPlayer(playerId, 'ARG', 'Amistoso', 10);
  expect(callup).toBe(null);  // Rejeitado
});

test('Lesão intl: +2 weeks recuperação extra', () => {
  engine.callupPlayer(playerId, 'BRA', 'Copa', 10);
  engine.processNationalMatch('BRA', 'loss', 10, [playerId]);  // Injured
  
  const injury = engine.getInjury(playerId);
  const expectedWeeks = normalWeeks + 2;
  expect(injury.weeksOut).toBe(expectedWeeks);
});

test('Squad max 23 players', () => {
  let count = 0;
  for (let i = 0; i < 24; i++) {
    const result = engine.callupPlayer(i, 'BRA', 'Amistoso', 10);
    if (result) count++;
  }
  expect(count).toBe(23);  // 24º rejeitado
});

test('Captain = maior OVR', () => {
  const squad = engine.getSquad('BRA');
  const captain = squad.find(p => p.role === 'captain');
  const ovrList = squad.map(p => p.ovr);
  expect(captain.ovr).toBe(Math.max(...ovrList));
});

test('Friendly: resultado não afeta standings', () => {
  const standingsBefore = engine.getStandings('Campeonato');
  engine.processNationalMatch('BRA', 'loss', 10);
  const standingsAfter = engine.getStandings('Campeonato');
  expect(standingsBefore).toEqual(standingsAfter);
});

test('Qualificador: resultado afeta standings intl', () => {
  const ptsBeforeQual = engine.getQualifierPoints('BRA');
  engine.processNationalMatch('BRA', 'win', 15);
  const ptsAfterQual = engine.getQualifierPoints('BRA');
  expect(ptsAfterQual).toBe(ptsBeforeQual + 3);  // W=3 pts
});
```

---
