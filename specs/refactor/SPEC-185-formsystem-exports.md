# SPEC-185: Re-export Form + TacticCounters via PlayerDevelopment barrel

**Status**: Active
**Owner**: Dudu
**AKITA**: AKITA-414
**Tracks**: BUG-F2-01 regression + SPEC-003 harness
**Phase**: 1 — TESTS RED→GREEN

---

## O que é

Restaurar caminho de import histórico `src/engine/PlayerDevelopment.js` para os símbolos `initForm`, `updateForm`, `getFormModifier`, `TACTIC_COUNTERS`. Após AKITA-411 (top-10 unit tests refactor) os símbolos foram extraídos para `src/engine/systems/FormSystem.js` (form) e `src/engine/tactical/TacticCounters.js` (counters), mas dois harness existentes ainda importam de `PlayerDevelopment.js`. PR restaura barrel via re-export — zero mudança de implementação, zero duplicação. Cobre 9 testes vermelhos (`tests/specs/audit-phase2-guards.test.js` + `tests/specs/SPEC-003-player-development.test.js`).

---

## Input

### Tipo

Estado pré-PR:

```text
src/engine/systems/FormSystem.js        → export { initForm, updateForm, getFormModifier, getFormEmoji }
src/engine/tactical/TacticCounters.js   → export const TACTIC_COUNTERS
src/engine/PlayerDevelopment.js         → export { ensureAttributes, processPlayerDevelopment, ageSquad, ... }
                                          (NÃO re-exporta form nem counters)
```

Tests importam:

```js
// tests/specs/audit-phase2-guards.test.js:11
import { initForm, updateForm, getFormModifier } from '../../src/engine/PlayerDevelopment.js';

// tests/specs/SPEC-003-player-development.test.js:3
import { processPlayerDevelopment, ageSquad, updateForm, getFormModifier,
         TACTIC_COUNTERS, ensureAttributes } from '../../src/engine/PlayerDevelopment.js';
```

### Origem

- Refactor AKITA-411 (extração FormSystem)
- Audit Phase 2 guards (BUG-F2-01 div-by-zero)

### Validação de input

- `FormSystem.js` exporta os 3 símbolos exatos.
- `TacticCounters.js` exporta `TACTIC_COUNTERS` (named export).
- `PlayerDevelopment.js` é módulo ESM puro (sem CJS).

---

## Output esperado

### Tipo

`src/engine/PlayerDevelopment.js` re-exporta os 4 símbolos via `export { ... } from`. Zero código novo de runtime. Zero alteração em testes.

### Exemplo concreto

```js
// novo no topo de PlayerDevelopment.js
export { initForm, updateForm, getFormModifier } from './systems/FormSystem.js';
export { TACTIC_COUNTERS } from './tactical/TacticCounters.js';
```

### Resultado de teste

```text
npx vitest run tests/specs/audit-phase2-guards.test.js tests/specs/SPEC-003-player-development.test.js
→ 9 passed, 0 failed
```

Suite global: 21 fails → ≤12 fails (apenas estes 9 saem do red).

---

## Regras de validação

- [ ] PR re-exporta exatamente 4 símbolos: `initForm`, `updateForm`, `getFormModifier`, `TACTIC_COUNTERS`.
- [ ] PR não duplica implementação (apenas `export ... from`).
- [ ] `npx vitest run tests/specs/audit-phase2-guards.test.js` → 4/4 ✅.
- [ ] `npx vitest run tests/specs/SPEC-003-player-development.test.js` → 5/5 ✅.
- [ ] `npm test` global: queda de ≥9 fails (21 → ≤12).
- [ ] `npm run lint` → 0 errors.
- [ ] `npm run build` → success, initial chunk ≤500KB (budget gate).
- [ ] CHANGELOG.md tem entrada AKITA-414.

---

## Forbidden

- [ ] ❌ Copiar implementação de `FormSystem.js` para dentro de `PlayerDevelopment.js`.
- [ ] ❌ Mover `TACTIC_COUNTERS` de volta para `PlayerDevelopment.js`.
- [ ] ❌ Mudar assinatura ou comportamento de `updateForm`/`getFormModifier`/`initForm`.
- [ ] ❌ Editar arquivos de teste em `tests/specs/` para "consertar" path (paths legítimos por contrato).
- [ ] ❌ Suprimir ou pular testes (`it.skip`, `describe.skip`).
- [ ] ❌ Commit com `--no-verify`.

---

## Implementação

### Arquivos

- `src/engine/PlayerDevelopment.js` — adicionar 2 linhas re-export no topo (após imports existentes).

### Arquivo de teste (harness)

Reaproveita testes existentes (regression test já presente):

- `tests/specs/audit-phase2-guards.test.js` — 4 testes BUG-F2-01.
- `tests/specs/SPEC-003-player-development.test.js` — 5 testes Player Development.

Nenhum teste novo necessário — falha atual é puramente import-resolution, não comportamento.

### Dependências internas

- `src/engine/systems/FormSystem.js` (não modificado).
- `src/engine/tactical/TacticCounters.js` (não modificado).

---

**Spec versão**: 1.0
**Última atualização**: 2026-05-18
**Protocolo**: AKITA SDD + Foundation-First (BLOCO 1 cleanup post-AKITA-411)
