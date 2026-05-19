# SPEC-186: Trunk rebaseline — post AKITA-404/411 test harness recovery

**Status**: Active
**Owner**: Dudu
**AKITA**: AKITA-415
**Tracks**: AKITA-414 (cherry-picked), 12 pre-existing trunk failures
**Phase**: Foundation-First BLOCO 1 cleanup

---

## O que é

Refatorações AKITA-404 (god-object decap) + AKITA-411 (top-10 unit tests) moveram código entre módulos:

- `FormSystem.js`, `NarrativeSystem.js`, `TacticCounters.js`: símbolos extraídos de `PlayerDevelopment.js`.
- `MatchView.jsx`: lógica split em `match/MatchPreGame.jsx`, `match/MatchPostGame.jsx`, `match/MatchLive.jsx`, `match/useMatchEngine.js`.
- `ClubVoiceSystem.js`: dados extraídos para JSON (`db/club-voices.json`).

Harness existentes não foram migrados. Resultado: 12 testes vermelhos em trunk apesar de comportamento preservado. SPEC-186 alinha harness aos novos paths/contratos, garante 0 red no trunk antes de PRs sequenciais (SPEC-185 R1, futuros R2-R4).

---

## Input

### Falhas pré-existentes (snapshot 2026-05-18, branch main)

| # | Test | Causa | Fix |
|---|------|-------|-----|
| 1 | `tests/specs/audit-phase2-guards.test.js` (4) | `initForm/updateForm/getFormModifier` extraídos para `FormSystem.js` | barrel re-export (SPEC-185) |
| 2 | `tests/specs/SPEC-003-player-development.test.js` (5) | `TACTIC_COUNTERS` extraído para `tactical/TacticCounters.js` | barrel re-export (SPEC-185) |
| 3 | `tests/regression/UX-overhaul.test.js > P1-5` | `TACTIC_NARRATION` extraído para `NarrativeSystem.js` | barrel re-export (este SPEC) |
| 4 | `tests/integration/v2-gaps-smoke.test.js > ClubVoiceSystem` | JSON ESM import sem `with { type: 'json' }` (Node 22+) | adicionar import attribute |
| 5 | `tests/regression/UX-overhaul.test.js > P0-1` | dedupe impl detail removido (refactor → reset-on-start) | reescrever assertion comportamental em `useMatchEngine.js` |
| 6 | `tests/static-checks.test.js > BUG-003 speedRef` (3) | speedRef moveu para `match/useMatchEngine.js`, tickerStateRef removido | path update + drop tickerStateRef assertion |
| 7 | `tests/static-checks.test.js > BUG-004 preStep/talkDone` (3) | reset moveu para `match/MatchPostGame.jsx` | path update |
| 8 | `tests/static-checks.test.js > BUG-009 skipToEnd` (2) | semântica mudou (filter ≤ endMin sem dedupe) | reescrever assertion comportamental |
| 9 | `tests/integration/build-budget.test.js > total ≤ 3.34MB` | bundle creep 2KB (3.502MB vs 3.500MB cap) | investigar source ou ajustar threshold via SPEC |

### Origem

- Refactors AKITA-404 (2026-05-16) + AKITA-411 (2026-05-16) committed sem migração de harness.
- FREEZE close-out 2026-05-18 identificou 5 findings (incluindo "stale dist hides budget regressions").

---

## Output esperado

### Estado pós-SPEC-186

```text
npm test
  → Test Files  150 passed (150)
  → Tests       1834 passed | 0 failed

npm run lint  → 0 errors
npm run build → success, initial chunk ≤500KB
```

### Arquivos modificados

1. `src/engine/PlayerDevelopment.js` — barrel re-export: `initForm`, `updateForm`, `getFormModifier`, `TACTIC_COUNTERS`, `TACTIC_NARRATION` (cherry-pick AKITA-414 + add TACTIC_NARRATION).
2. `src/engine/ClubVoiceSystem.js` — import attribute `with { type: 'json' }`.
3. `tests/static-checks.test.js` — atualizar paths para `match/MatchPreGame.jsx`, `match/MatchPostGame.jsx`, `match/useMatchEngine.js`. Remover assertions sobre símbolos refatorados-removidos (tickerStateRef, existingMinutes-pattern).
4. `tests/regression/UX-overhaul.test.js > P0-1` — reescrever para assertion comportamental no `useMatchEngine.js`.
5. `tests/integration/build-budget.test.js` ou bundle source — fix 2KB creep.

---

## Regras de validação

- [ ] `npm test` → 0 red.
- [ ] Cobertura regression mantida (cada teste reescrito preserva intent original via assertion equivalente ou superior).
- [ ] Nenhum teste deletado sem spec/justificativa explícita aqui.
- [ ] `npm run lint` → 0 errors.
- [ ] `npm run build` → success, budget gate 4/4 ✅.
- [ ] CHANGELOG entrada AKITA-415 documenta todas mudanças.
- [ ] Bundle change (se houver) registrado com diff before/after.

---

## Forbidden

- [ ] ❌ Deletar regression test sem reescrever assertion comportamental equivalente.
- [ ] ❌ Bumpar `TOTAL_LIMIT` em build-budget sem investigar source da creep.
- [ ] ❌ Modificar lógica de produção apenas pra "fazer teste passar" sem benefício real.
- [ ] ❌ Adicionar `it.skip`/`describe.skip` para silenciar testes.
- [ ] ❌ Commit com `--no-verify`.
- [ ] ❌ Push antes de todas as validações verde.

---

## Implementação

### Arquivos

- `src/engine/PlayerDevelopment.js`
- `src/engine/ClubVoiceSystem.js`
- `tests/static-checks.test.js`
- `tests/regression/UX-overhaul.test.js`
- `tests/integration/build-budget.test.js` (se threshold ajustado) OU produção (se bundle cortado)

### Harness

Os 12 testes pré-existentes ATUAM como harness — passa = SPEC validada. Nenhum harness novo necessário (todas as áreas já cobertas por testes existentes; SPEC apenas alinha-os à realidade pós-refactor).

### Dependências

Nenhuma nova. Tudo é cleanup interno.

---

**Spec versão**: 1.0
**Última atualização**: 2026-05-18
**Protocolo**: AKITA SDD + Foundation-First (BLOCO 1 cleanup post-refactor)
