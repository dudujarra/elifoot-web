# SPEC-149: Imitation Learning — Extrair Sequências Positivas para DAgger

> **Origem**: dataset-finetune.jsonl tem 259 tuplas. Filtrar sequências com outcome positivo
> para usar como exemplos de imitation learning no DAgger warm-start.

---

## O que é

Script que filtra o dataset de fine-tuning pelas "sequências campeãs" — decisões seguidas de
outcomes positivos — e as formata para injeção no DAgger bootstrap do agente.

---

## Input

```typescript
// docs/dataset-finetune.jsonl (já existe)
// Filtros de qualidade:
outcome.won === 1           // resultado foi positivo
outcome.rewardDelta > 0     // reward também positivo (se disponível)
action !== 'DREAD_RELEGATION' // não contar pânico como boa decisão
```

---

## Output esperado

```typescript
// docs/dataset-imitation.jsonl
// Cada linha:
{
  "state": { "emotion": "CALM", "tactic": "offensive", "position": 3, ... },
  "action": "TACTIC_CHANGE",
  "actionArgs": { "from": "counter", "to": "offensive" },
  "quality": "positive"   // marcador para DAgger
}
// + docs/imitation-stats.json com breakdown
```

---

## Regras de validação

- [ ] Dataset imitation tem ≥ 50 exemplos positivos
- [ ] Nenhum `DREAD_RELEGATION` no dataset imitation
- [ ] Distribuição de ações: TACTIC_CHANGE ≥ 10%, TRAIN ≥ 10%, TEAM_TALK ≥ 10%
- [ ] `imitation-stats.json` reporta total, breakdown por ação, win rate médio

---

## Forbidden

- [ ] DREAD_RELEGATION ou NARRATIVE_EVENT no dataset imitation
- [ ] Dataset com 0 exemplos de TACTIC_CHANGE (enviesado)
- [ ] Duplicatas (mesmo week+season+action)

---

## Implementação

**Arquivo**: `scripts/extract-imitation-dataset.js`

```javascript
#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const lines = readFileSync('docs/dataset-finetune.jsonl', 'utf-8')
    .split('\n').filter(Boolean);

const [meta, ...tuples] = lines.map(l => JSON.parse(l));

const EXCLUDED = new Set(['DREAD_RELEGATION', 'NARRATIVE_EVENT', 'PRESS_CONFERENCE']);

const positive = tuples.filter(t =>
    !EXCLUDED.has(t.action) &&
    (t.outcome?.won === 1 || t.outcome?.rewardDelta > 0)
);

const output = [
    JSON.stringify({ meta: { total: positive.length, source: 'dataset-finetune.jsonl' } }),
    ...positive.map(t => JSON.stringify({
        state: t.input,
        action: t.action,
        actionArgs: t.actionArgs,
        quality: 'positive',
    }))
].join('\n');

writeFileSync('docs/dataset-imitation.jsonl', output + '\n');

// Stats
const breakdown = {};
positive.forEach(t => { breakdown[t.action] = (breakdown[t.action] || 0) + 1; });
writeFileSync('docs/imitation-stats.json', JSON.stringify({ total: positive.length, breakdown }, null, 2));
console.log(`Extracted ${positive.length} positive examples`);
```

---

## Testes

```javascript
describe('SPEC-149: Imitation Learning Dataset', () => {
  test('>= 50 exemplos positivos', () => { /* count */ });
  test('zero DREAD_RELEGATION', () => { /* filter */ });
  test('TACTIC_CHANGE >= 10%', () => { /* breakdown */ });
  test('sem duplicatas', () => { /* dedup check */ });
  test('imitation-stats.json gerado', () => { /* file exists */ });
});
```
