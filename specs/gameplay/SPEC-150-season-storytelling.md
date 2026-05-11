# SPEC-150: Season Storytelling — Momentos Históricos Automáticos

> **Origem**: deep soak v1 — cada temporada tem dados ricos (wins/draws/losses/topScorer/goleadas).
> Nenhum sistema gera "história da temporada" automaticamente. Dado desperdiçado.

---

## O que é

Gera automaticamente um "resumo narrativo" de cada temporada ao final,
usando os dados já disponíveis (topScorer, biggest win, streaks, promoção/rebaixamento).
Armazenado em `engine.seasonHistory` para exibir na UI e no autoplay log.

---

## Input

```typescript
// Dados disponíveis ao fim de cada temporada:
managerStats: { wins, draws, losses, goalsFor, goalsAgainst }
topScorer: { name, goals }
insights: { longestWinStreak, biggestWin, worstLoss }
position: number
promoted: boolean
relegated: boolean
division: number
```

---

## Output esperado

```typescript
// engine.seasonHistory[season] = {
//   headline: "Campeão da Série A com goleada histórica de 7-1",
//   topScorer: "Igor Moura — 28 gols",
//   record: "24V 5E 9D",
//   moment: "Sequência de 10 vitórias na reta final",
//   mood: "epic" | "tragic" | "mediocre" | "survival"
// }
```

---

## Regras de validação

- [ ] `engine.seasonHistory` populado para cada temporada após season-end
- [ ] `headline` sempre não-vazio e contextual (menciona posição ou título)
- [ ] `mood` = "epic" quando título ganho; "tragic" quando rebaixado; "survival" quando evitou rebaixamento
- [ ] `topScorer` formatado corretamente (`"Nome — N gols"`)
- [ ] Autoplay log inclui headline ao início de cada nova temporada

---

## Forbidden

- [ ] `headline` genérico ("Temporada encerrada") sem contexto
- [ ] `topScorer` null quando havia gols marcados
- [ ] `seasonHistory` sobrescrevendo temporada anterior

---

## Implementação

**Arquivo novo**: `src/engine/SeasonStoryEngine.js`

```javascript
export function generateSeasonStory({ wins, draws, losses, goalsFor, goalsAgainst,
    topScorer, longestWinStreak, biggestWin, worstLoss, position, promoted, relegated,
    division, seasonNumber }) {

    const record = `${wins}V ${draws}E ${losses}D`;
    const mood = promoted && wins > 20 ? 'epic'
        : relegated ? 'tragic'
        : position <= 3 ? 'great'
        : position >= 17 ? 'survival'
        : 'mediocre';

    let headline;
    if (promoted && wins > 20) {
        headline = `Campeão e promovido com ${wins} vitórias!`;
    } else if (promoted) {
        headline = `Promovido para ${['', 'Série A','Série B','Série C','Série D'][division - 1] || 'divisão acima'}`;
    } else if (relegated) {
        headline = `Rebaixado após temporada difícil (${wins}V)`;
    } else if (longestWinStreak >= 8) {
        headline = `Sequência histórica de ${longestWinStreak} vitórias seguidas`;
    } else if (biggestWin) {
        headline = `Goleada memorável de ${biggestWin}`;
    } else {
        headline = `Temporada ${position}º lugar — ${wins}V ${draws}E ${losses}D`;
    }

    const scorerText = topScorer?.goals > 0
        ? `${topScorer.name} — ${topScorer.goals} gols`
        : null;

    const moment = longestWinStreak >= 5
        ? `Sequência de ${longestWinStreak} vitórias`
        : worstLoss ? `Goleada sofrida: ${worstLoss}` : null;

    return { headline, topScorer: scorerText, record, moment, mood, season: seasonNumber };
}
```

**Integrar em `src/services/SeasonProcessor.js`**:
```javascript
import { generateSeasonStory } from '../engine/SeasonStoryEngine.js';
// No final de _processLegacy():
const story = generateSeasonStory({ ...engine.managerStats, topScorer, position, ... });
if (!engine.seasonHistory) engine.seasonHistory = [];
engine.seasonHistory.push(story);
engine.weekEvents.push(`📖 ${story.headline}`);
```

---

## Testes

```javascript
describe('SPEC-150: Season Storytelling', () => {
  test('headline não-vazio em toda temporada', () => { /* always string */ });
  test('mood epic quando campeão com 20+ wins', () => { /* mood === epic */ });
  test('mood tragic quando rebaixado', () => { /* mood === tragic */ });
  test('topScorer formatado corretamente', () => { /* "Nome — N gols" */ });
  test('seasonHistory acumula temporadas, não sobrescreve', () => { /* array grows */ });
  test('headline menciona contexto (não genérico)', () => { /* not includes "encerrada" */ });
});
```
