# SPEC-192: Orphan `realPlayers.json` cleanup (post SPEC-177)

> **5-min cleanup**. SPEC-177 split monolithic `realPlayers.json` (2MB) into 4 regional chunks (BRA/EUR/SAM/pool). Original file kept "in case any code still references it" (defensive fallback). Audit confirms zero LIVE imports — delete file + dead fallback code.

---

## O que é

Deletar `src/data/realPlayers.json` (orphan, 2.0MB) e remover código defensivo morto que referenciava ele. Atualizar instrução obsoleta no scraper tool.

**Não muda comportamento**. Bundle output idêntico (já não entrava — `vite.config.js` linha defensive nunca foi acionada).

---

## Input

### Arquivos a tocar
- `src/data/realPlayers.json` — **DELETE** (orphan 2MB)
- `vite.config.js` linha 28 — **DELETE** legacy fallback (`if (id.includes('realPlayers.json')) return 'player-data';`)
- `tools/squad-scraper/src/index.js` linha 56 — **UPDATE** instrução: apontar pros JSONs regionais (`realPlayers_BRA.json` etc) em vez do monolítico
- `tests/integration/build-budget.test.js` linha 23 — **UPDATE** DATA_CHUNKS regex: remover `player-data|` (sem matches possíveis após delete)

### Origem
- SPEC-177 split: `src/engine/data.js:13-17` faz `import('../data/realPlayers_{BRA,EUR,SAM,pool}.json')` — zero imports do `realPlayers.json`
- Verificação: `grep -rln "realPlayers\.json" src/ tests/` exclui `realPlayers_*.json` matches
- Zero referências LIVE em `src/` ou `tests/`

---

## Output esperado

### 1. `src/data/realPlayers.json` removido
- `ls src/data/realPlayers.json` → no such file
- `du -sh src/data/` reduz em 2MB

### 2. `vite.config.js` linha 27-28 removida
Antes:
```js
// SPEC-159 legacy fallback (kept in case any code still references the
// monolithic JSON — it shouldn't, but we play defense).
if (id.includes('realPlayers.json')) return 'player-data';
```
Depois: bloco deletado (regional matchers permanecem).

### 3. `tools/squad-scraper/src/index.js:56` atualizado
Antes:
```
Para importar no jogo, basta juntar esse JSON com o src/data/realPlayers.json
```
Depois:
```
Para importar no jogo, mesclar com src/data/realPlayers_BRA.json (clubes brasileiros) — SPEC-177
```

### 4. `tests/integration/build-budget.test.js:23` simplificado
Antes: `const DATA_CHUNKS = /^(player-data|realPlayers_)/;`
Depois: `const DATA_CHUNKS = /^realPlayers_/;`

---

## Regras de validação

### Checklist
- [ ] `src/data/realPlayers.json` ausente
- [ ] `grep -rln "realPlayers\.json" src/ tests/` retorna **zero** (ou só matches de `realPlayers_*.json`)
- [ ] `npm run build` clean
- [ ] `npm test` — 1841/1841 ✅ (nenhum teste depende do orphan)
- [ ] `tests/integration/build-budget.test.js` 4/4 ✅
- [ ] Bundle total **igual ou menor** que pré-cleanup

### Harness (Regra 0)
**Arquivo**: `tests/integration/spec-192-no-orphan-realplayers.test.js`

```javascript
import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');

describe('SPEC-192: no orphan realPlayers.json', () => {
    test('src/data/realPlayers.json removed', () => {
        expect(existsSync(join(projectRoot, 'src/data/realPlayers.json'))).toBe(false);
    });

    test('regional chunks intact', () => {
        for (const region of ['BRA', 'EUR', 'SAM', 'pool']) {
            expect(existsSync(join(projectRoot, `src/data/realPlayers_${region}.json`))).toBe(true);
        }
    });

    test('vite.config has no legacy realPlayers.json fallback', () => {
        const cfg = readFileSync(join(projectRoot, 'vite.config.js'), 'utf-8');
        // Must NOT contain bare realPlayers.json check (only regional matchers)
        expect(cfg).not.toMatch(/id\.includes\('realPlayers\.json'\)/);
    });
});
```

---

## Forbidden

1. **Manter `src/data/realPlayers.json`** "por segurança" — Akita Mandamento brutal #10 contra docs/código fantasma.
2. **Deletar realPlayers_BRA/EUR/SAM/pool.json** — esses são LIVE (data.js usa).
3. **Restaurar via git** se algum teste quebrar — investigar root cause (teste depende de orphan = teste errado).
4. **Adicionar feature scope** — só cleanup, zero behavior change.

---

## Dependências
- SPEC-177 (split prévio) — pré-requisito ✅
- Zero outras

## Estimativa
- Delete + edits: 5min
- Harness: 5min
- Build + test: 5min
- CHANGELOG + commit + PR: 5min
- **Total: ~20min**
