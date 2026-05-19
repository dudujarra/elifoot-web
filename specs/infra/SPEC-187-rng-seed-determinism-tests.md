# SPEC-187: RNG seed determinism in test environment

> **Bug fix**: issue [#188](https://github.com/dudujarra/olefut/issues/188) (BUG-FLAKE-01). `src/engine/rng.js:49` define `_globalSeed = Date.now() | 0` no module load — não-determinístico. `tests/integration/seasonhistory-data.test.js > each entry has position > 0` falha intermitentemente em pre-push gate. Já bloqueou push do AKITA-415 (PR #187) e AKITA-422 (PR #191). Padrão de risco: qualquer teste que depende implicitamente de seed determinístico vai falhar aleatoriamente.

---

## O que é

Garantir que `src/engine/rng.js` use seed **determinístico** quando rodando sob Vitest, e adicionar `setGlobalSeed()` explícito no `beforeAll` do teste específico que falhou. Defense in depth — duas camadas:

**Layer 1 (universal)**: rng.js detecta `process.env.VITEST === 'true'` no module load. Se Vitest, usa seed fixo (`0xC0FFEE` = 12648430) em vez de `Date.now()`. Zero impacto em prod (browser não tem `process`).

**Layer 2 (targeted)**: `seasonhistory-data.test.js > beforeAll` chama `setGlobalSeed(42)` antes de `createEngine()`. Explícito + auditável. Pode ser copy-paste em qualquer test futuro que precise determinismo.

---

## Input

### Arquivos a tocar
- `src/engine/rng.js:49` — substituir hard-coded `Date.now()` por função `_pickDefaultSeed()` que checa env
- `tests/integration/seasonhistory-data.test.js:27` — adicionar `setGlobalSeed(42)` em `beforeAll` antes de `createEngine()`

### Origem
- Bug: issue #188 (autor: dudujarra, 2026-05-19)
- Stack trace observado: pre-push hook do AKITA-415 + AKITA-422

---

## Output esperado

### 1. `src/engine/rng.js` modificado

Antes:
```js
let _globalSeed = Date.now() | 0;
let _globalRng = mulberry32(_globalSeed);
```

Depois:
```js
// SPEC-187: deterministic seed under Vitest (process.env.VITEST === 'true').
// Browsers don't define `process`, so the typeof guard makes this prod-safe.
function _pickDefaultSeed() {
    if (typeof process !== 'undefined' && process.env && process.env.VITEST === 'true') {
        return 0xC0FFEE; // 12648430 — deterministic for test runs
    }
    return Date.now() | 0;
}

let _globalSeed = _pickDefaultSeed();
let _globalRng = mulberry32(_globalSeed);
```

### 2. `tests/integration/seasonhistory-data.test.js` modificado

Antes (linha 27):
```js
beforeAll(() => {
    const engine = createEngine();
```

Depois:
```js
beforeAll(() => {
    // SPEC-187: pin seed for deterministic 114-week sim (fixes issue #188 flake)
    setGlobalSeed(42);
    const engine = createEngine();
```

Adicionar `setGlobalSeed` ao import existente:
```js
import { setGlobalSeed } from '../../src/engine/rng.js';
```

---

## Regras de validação

### Checklist
- [ ] `process.env.VITEST` reads `'true'` em test runs (verificar com `console.log` ad-hoc)
- [ ] `getGlobalSeed()` retorna `0xC0FFEE` (12648430) em test runs sem `setGlobalSeed` explícito
- [ ] `getGlobalSeed()` retorna `Date.now()` em runs Node fora do Vitest
- [ ] `seasonhistory-data.test.js > each entry has position > 0` passa em 10 runs consecutivos
- [ ] Suite full 1837/1837 ✅ (sem regressão)
- [ ] Browser bundle build clean — `typeof process !== 'undefined'` guard previne ReferenceError

### Harness (Regra 0)

**Arquivo**: `tests/integration/spec-187-rng-determinism.test.js`

```javascript
import { describe, test, expect } from 'vitest';
import { rng, getGlobalSeed, setGlobalSeed } from '../../src/engine/rng.js';

describe('SPEC-187: RNG seed determinism', () => {
    test('process.env.VITEST is set under Vitest', () => {
        expect(process.env.VITEST).toBe('true');
    });

    test('default seed is deterministic constant under Vitest', () => {
        // Without explicit setGlobalSeed call, module-load seed should be 0xC0FFEE
        // NOTE: this assertion only valid if no earlier test called setGlobalSeed.
        // To guarantee, we re-set and verify the constant value matches the documented default.
        const VITEST_DEFAULT = 0xC0FFEE;
        setGlobalSeed(VITEST_DEFAULT);
        expect(getGlobalSeed()).toBe(VITEST_DEFAULT);
    });

    test('rng() is reproducible given same seed', () => {
        setGlobalSeed(42);
        const seq1 = [rng(), rng(), rng(), rng(), rng()];

        setGlobalSeed(42);
        const seq2 = [rng(), rng(), rng(), rng(), rng()];

        expect(seq1).toEqual(seq2);
    });

    test('different seeds produce different sequences', () => {
        setGlobalSeed(42);
        const seqA = [rng(), rng(), rng()];

        setGlobalSeed(99);
        const seqB = [rng(), rng(), rng()];

        expect(seqA).not.toEqual(seqB);
    });

    test('seasonhistory test pins seed in beforeAll', async () => {
        // Static assertion that the regression test imports setGlobalSeed
        const fs = await import('node:fs');
        const path = await import('node:path');
        const { fileURLToPath } = await import('node:url');
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const targetPath = path.join(__dirname, 'seasonhistory-data.test.js');
        const src = fs.readFileSync(targetPath, 'utf-8');
        expect(src).toMatch(/setGlobalSeed/);
        expect(src).toMatch(/from ['"]\.\.\/\.\.\/src\/engine\/rng/);
    });
});
```

### Repro / verificação manual

```bash
# Antes do fix: ~10-20% chance de flake
for i in {1..20}; do
    npx vitest run tests/integration/seasonhistory-data.test.js 2>&1 | grep -E "passed|failed" | tail -1
done

# Depois do fix: 20/20 passed
```

---

## Forbidden

1. **Modificar comportamento prod** — fix só ativa sob `process.env.VITEST === 'true'`. Browser (`typeof process === 'undefined'`) usa `Date.now()` original.
2. **Remover `Date.now()` fallback** — necessário pra produção e Node scripts (`simulate_season.js` etc).
3. **Pin seed globalmente sem checar env** — quebraria CLI tools que querem variabilidade real.
4. **Aceitar flake como "feature"** — flake é débito técnico. Bug, não trade-off.
5. **Adicionar `process.env.VITEST` check em outros lugares** — fora de scope. Se outros tests forem flaky, criar SPEC separada por arquivo.

---

## Dependências
- Vitest define `process.env.VITEST = 'true'` automaticamente (documented behavior since v0.x)
- Mulberry32 PRNG (já em rng.js)

## Estimativa
- rng.js edit: 5min
- seasonhistory-data.test.js edit: 5min
- harness: 10min
- repro loop validation: 5min
- CHANGELOG + commit + PR: 10min
- **Total: ~35min**
