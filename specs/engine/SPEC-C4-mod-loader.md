# SPEC-C4: ModLoader (Mod-Friendly Hooks)

> Status: **DRAFT — implementação no mesmo PR**
> Fase: C4 — Tornar MEMORÁVEL

---

## O que é

Sistema de carregamento de cartas customizadas via JSON. Modders BR colocam arquivo em `/public/mods/cards/<deck>/<file>.json` ou via URL — `ModLoader.load(...)` valida estrutura e devolve array de cartas seguras pra mergir nos decks oficiais (MatchEventsDeck, BenchEventsDeck, MidMatchManagerDeck, OffPitchEventsDeck).

Diferencial vs Brasfoot/FM (fechados): comunidade pode adicionar conteúdo sem editar engine.

---

## Input/Output

```typescript
// load(jsonText) → returns { valid: Card[], errors: ModError[] }
{
  valid: Array<{ id, text, options: [...], _modSource?: string }>,
  errors: Array<{ cardId?, field, message }>
}
```

---

## Regras

### 1. Validação obrigatória por carta
- [ ] `id`: string non-empty, único (não colide com built-ins via prefix `mod_`)
- [ ] `text`: string non-empty
- [ ] `options`: array com 2-5 entries
- [ ] Cada option: `label` string, `effect` object, `resultText` string

### 2. Sanitização
- [ ] HTML/script stripped do `text` e `resultText`
- [ ] Effect campos restritos: moralDelta, energyDelta, tacticShift, stress, boss, fans, teammates, sponsors (whitelist)
- [ ] Valores numéricos clamped ±20

### 3. Prefix mandatório
- [ ] Card ID deve começar com `mod_` pra evitar colisão com IDs builtin
- [ ] Se ausente, ModLoader injeta automático

### 4. Tier opcional
- [ ] Modder pode setar `tier: 'common'|'uncommon'|'rare'|'legendary'`
- [ ] Default: `common`

### 5. Forbidden
- [ ] Carta sem options → rejeitada
- [ ] Effect com campo fora da whitelist → strip silent
- [ ] Texto com `<script>`, `<iframe>` etc → rejeitada
- [ ] Numero absurdo (>20) → clamp

---

## Implementação

- **Novo**: `src/engine/ModLoader.js` (~140 LOC)
- **Novo harness**: `tests/specs/SPEC-C4-mod-loader.test.js`
- **Doc**: README sample JSON em comentário do módulo

---

## Sample mod card JSON

```json
{
  "deck": "mid_match_manager",
  "cards": [
    {
      "id": "mod_custom_substituicao_audaciosa",
      "text": "Vai trocar 3 jogadores ao mesmo tempo?",
      "options": [
        { "label": "Confiar no banco", "effect": { "moralDelta": 5 }, "resultText": "Banco honra a confiança." },
        { "label": "Manter time", "effect": {}, "resultText": "Mantém estabilidade." }
      ]
    }
  ]
}
```

---

**SPEC versão**: 1.0
