# SPEC-025: Advanced Player Aging & Retirement

**Criticidade**: 🟡 ALTO  
**Módulo**: `src/engine/PlayerCareer.js` (update)  
**Linhas**: ~200

---

## O que é

Expansão Player Development. Fases de carreira (Young/Prime/Declining/Legend), retirement window, second wind.

---

## Career Phases

| Fase | Idade | OVR change | Duração | Multiplicador |
|------|-------|-----------|---------|---|
| Young (16-21) | 16-21 | +1-3/season | 6 years | 1.5x growth |
| Ascending (22-26) | 22-26 | +0.5-2/season | 5 years | 1.2x growth |
| Prime (27-32) | 27-32 | -0.5 a +1/season | 6 years | 1.0x (estável) |
| Declining (33-36) | 33-36 | -2 a -0.5/season | 4 years | 0.7x (queda) |
| Veteran (37-39) | 37-39 | -3 a -1/season | 3 years | 0.5x (queda rápida) |

---

## Special Events

| Evento | Trigger | Effect | Probabilidade |
|--------|---------|--------|---|
| Second Wind | Age 33+, personality Resilience, wins streak | +2 OVR temp (4 weeks) | 5% |
| Golden Boot | Age 28-32, striker, +5 goals | +1 FIN | 10% |
| Late Bloomer | Age 31, +10 potential, personality | +3 all attributes (1 season) | 3% |
| Injury scare | Age 35+, contact match | -1 permanent OVR | 20% |
| Glory run | Age 34+, title win | +1 prestige intl | 15% |
| Retirement offer | Age 37+ | Ofertas de coaching/admin | Auto |

---

## Input

```typescript
PlayerCareer.updateAgePhase({
  playerId: number,
  newAge: number,
  seasonYear: number
})

PlayerCareer.checkRetirementOffer({
  playerId: number,
  ovr: number,
  personality: string
})

PlayerCareer.applySpecialEvent({
  playerId: number,
  event: string,
  bonus: number
})
```

---

## Output

```typescript
{
  playerId: number,
  age: number,
  phase: string,
  ovrChange: number,
  seasonGrowth: number,
  retirementRisk: number (0-100),
  nextPhaseETA: number (years),
  specialEvent: {
    triggered: boolean,
    type: string,
    bonus: number
  }
}
```

---

## Validações

- [ ] Fase baseada em idade (não player choice)
- [ ] OVR nunca > potential
- [ ] Phase transition suave (não drop abrupto)
- [ ] Second wind não stacks (1× por carreira)
- [ ] Retirement offer só após 37 anos
- [ ] Special events não garantidos (rolagem)
- [ ] Late bloomer overrides queda idade (anomalia realista)
- [ ] Personality afeta probability eventos

---

## Forbidden

- [ ] OVR < 45 em prime
- [ ] Age > 40 em ativo (auto-retire)
- [ ] Second wind sem 33+ anos
- [ ] Personality muda mid-carreira
- [ ] Special event durante injury
- [ ] OVR jump > 3 em 1 week

---

## Testes

```javascript
test('Prime (27-32): OVR estável', () => {
  const p = engine.getPlayer(playerId);
  p.age = 29;  // Prime
  
  const growth = engine.getSeasonGrowth(playerId);
  expect(Math.abs(growth)).toBeLessThanOrEqual(1);  // -1 a +1
});

test('Declining (33-36): -2 a -0.5 OVR/season', () => {
  p.age = 34;
  const growth = engine.getSeasonGrowth(playerId);
  expect(growth).toBeGreaterThanOrEqual(-2);
  expect(growth).toBeLessThanOrEqual(-0.5);
});

test('Second wind: +2 OVR temp (4 weeks)', () => {
  p.age = 35;
  engine.triggerSecondWind(playerId);
  
  const ovrNow = engine.getPlayer(playerId).ovr;
  const ovrBefore = ovrNow - 2;
  
  engine.processWeeks(4);
  const ovrAfter = engine.getPlayer(playerId).ovr;
  
  expect(ovrAfter).toBe(ovrBefore);  // Volta ao normal
});

test('Retirement offer após 37 anos', () => {
  p.age = 37;
  const offer = engine.getRetirementOffer(playerId);
  
  expect(offer).toBeDefined();
  expect(offer.role).toMatch(/coach|scout|admin/);
});

test('Late bloomer: personality Resilient', () => {
  p.age = 31;
  p.personality = 'Resilient';
  p.potential = 90;
  
  const event = engine.checkSpecialEvent(playerId);
  if (event && event.type === 'Late bloomer') {
    const ovrGain = engine.getPlayer(playerId).ovr - initialOvr;
    expect(ovrGain).toBe(3);
  }
});

test('Age > 40: auto-retire', () => {
  p.age = 41;
  const status = engine.getPlayer(playerId).status;
  
  expect(status).toBe('retired');
});
```

---

## Personality Modifiers

```javascript
const personalityMods = {
  'Hardworking': { secondWind: 1.5, lateBloom: 1.3 },
  'Resilient': { lateBloom: 1.5, injuryScare: 0.7 },
  'Ambitious': { gloryRun: 1.3, decline: 0.8 },
  'Veteran': { secondWind: 2.0, retire: 1.5 },
  'Natural': { decline: 0.9, prime: 1.1 }
};
```

---
