# SPEC-B6: Brazilian Atmosphere (Camada 1)

> Status: **DRAFT — implementação no mesmo PR**
> Fase: B6 — Tornar PRAZEROSO (GAME-DESIGN-ROADMAP)

---

## O que é

Camada cosmética de **brasilianidade** para match events. Adiciona 30+ atmosphere strings PT-BR contextual (torcida, estádio, clima, região, classico). Templating layer pronta para wiring via MatchEventsDeck no futuro.

Resolve problema #4 do roadmap: "Brasilianidade é só nome de clube".

---

## Input

```typescript
{
  eventType: 'goal' | 'goal_home' | 'goal_away' | 'card' | 'red_card' | 'miss' | 'save' | 'derby' | 'late_drama',
  context?: { stadium?: string, region?: 'NE'|'SE'|'S'|'CO'|'N', isDerby?: boolean, weather?: string }
}
```

---

## Output

```typescript
{
  flavorString: string,  // 1 frase PT-BR
  category: string,
}
```

---

## Regras

### 1. Catálogo mínimo
- [ ] ≥30 strings totais
- [ ] Cobertura: goal (8+), card (5+), miss (4+), save (4+), derby (5+), late_drama (4+)

### 2. PT-BR autêntico
- [ ] Referências culturais BR (Maracanã, Vila Belmiro, Beira-Rio, Pacaembu, Mineirão)
- [ ] Vocabulário (camisa, comando, virada, beira de campo, raça, mística)

### 3. Determinístico via seed
- [ ] `getAtmosphere(eventType, seed)` retorna string previsível

### 4. Forbidden
- [ ] Sem emoji
- [ ] Sem termo estrangeiro (não usar "performance", "balance" — preferir "rendimento", "equilíbrio")
- [ ] Sem profanidade

---

## Implementação

- **Novo**: `src/engine/BrazilianAtmosphere.js` (~120 LOC)
- **Novo harness**: `tests/specs/SPEC-B6-brazilian-atmosphere.test.js`
- **NOT wired** neste PR — wiring fica para B6.2 (separate)

---

**SPEC versão**: 1.0
